import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { emitEvent } from '../config/kafka';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import { minioClient } from '../config/storage';
import path from 'path';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const userRepository = AppDataSource.getRepository(User);

        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = userRepository.create({
            email,
            password: hashedPassword,
        });

        await userRepository.save(user);

        // --- Kafka Event Emission ---
        await emitEvent('user-registered', {
            userId: user.id,
            email: user.email,
            timestamp: new Date().toISOString()
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login a user and return JWT
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'role']
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '1h' }
        );

        // --- Kafka Event Emission (Optional: for auditing) ---
        await emitEvent('user-login', {
            userId: user.id,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});
/**
 * @route   POST /api/auth/avatar
 * @desc    Upload user avatar to MinIO
 * @access  Private
 */
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOneBy({ id: req.user?.id });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const filename = `avatar-${user.id}${path.extname(req.file.originalname)}`;
        const bucketName = process.env.MINIO_BUCKET_NAME || 'profiles';

        // Upload to MinIO
        await minioClient.putObject(
            bucketName,
            filename,
            req.file.buffer,
            req.file.size,
            { 'Content-Type': req.file.mimetype }
        );

        // Construct public URL
        const avatarUrl = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9010'}/${bucketName}/${filename}`;

        // Update user in DB
        user.avatarUrl = avatarUrl;
        await userRepo.save(user);

        // QA: Emit event for audit trail
        await emitEvent('user-avatar-updated', {
            userId: user.id,
            avatarUrl,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({
            message: 'Avatar uploaded successfully',
            avatarUrl
        });
    } catch (error) {
        console.error('[auth-service]: Avatar upload failed:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

export default router;
