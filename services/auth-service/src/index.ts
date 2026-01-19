import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import 'reflect-metadata';
import { apiReference } from '@scalar/express-api-reference';
import cors from 'cors';
import { AppDataSource } from './config/database';
import { initKafka } from './config/kafka';
import { initStorage } from './config/storage';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/error';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// --- Database Initialization ---
const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('[auth-service]: Database connected successfully 🗄️');

        await initKafka();
        await initStorage();

        // --- Routes ---
        app.use('/api/auth', authRoutes);

        // --- API Documentation (Scalar) ---
        // QA Note: Providing a clear API contract is essential for testing.
        app.use(
            '/docs',
            apiReference({
                spec: {
                    content: {
                        openapi: '3.1.0',
                        info: {
                            title: 'Eurusys Auth Service API',
                            version: '1.0.0',
                            description: 'Authentication and User Management Service API Reference.',
                        },
                        paths: {
                            '/api/auth/register': {
                                post: {
                                    summary: 'Register a new user',
                                    tags: ['Authentication'],
                                    requestBody: {
                                        content: {
                                            'application/json': {
                                                schema: {
                                                    type: 'object',
                                                    properties: {
                                                        email: { type: 'string', example: 'user@example.com' },
                                                        password: { type: 'string', example: 'password123' },
                                                    },
                                                    required: ['email', 'password'],
                                                },
                                            },
                                        },
                                    },
                                    responses: {
                                        '201': { description: 'User created' },
                                        '400': { description: 'Missing fields' },
                                        '409': { description: 'User exists' },
                                    },
                                },
                            },
                            '/api/auth/login': {
                                post: {
                                    summary: 'Login and get JWT',
                                    tags: ['Authentication'],
                                    requestBody: {
                                        content: {
                                            'application/json': {
                                                schema: {
                                                    type: 'object',
                                                    properties: {
                                                        email: { type: 'string', example: 'user@example.com' },
                                                        password: { type: 'string', example: 'password123' },
                                                    },
                                                    required: ['email', 'password'],
                                                },
                                            },
                                        },
                                    },
                                    responses: {
                                        '200': { description: 'Login successful' },
                                        '401': { description: 'Unauthorized' },
                                    },
                                },
                            },
                            '/api/auth/avatar': {
                                post: {
                                    summary: 'Upload user profile picture',
                                    tags: ['Management'],
                                    security: [{ bearerAuth: [] }],
                                    requestBody: {
                                        content: {
                                            'multipart/form-data': {
                                                schema: {
                                                    type: 'object',
                                                    properties: {
                                                        avatar: {
                                                            type: 'string',
                                                            format: 'binary',
                                                            description: 'Image file to upload'
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    responses: {
                                        '200': { description: 'Avatar updated' },
                                        '401': { description: 'Unauthorized' },
                                        '400': { description: 'Bad request (missing file)' },
                                    },
                                },
                            },
                        },
                        components: {
                            securitySchemes: {
                                bearerAuth: {
                                    type: 'http',
                                    scheme: 'bearer',
                                    bearerFormat: 'JWT',
                                },
                            },
                        },
                    },
                },
            }),
        );

        // --- Health Check Endpoints ---
        app.get('/health/live', (req: Request, res: Response) => {
            res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
        });

        app.get('/health/ready', async (req: Request, res: Response) => {
            const isDbConnected = AppDataSource.isInitialized;
            if (isDbConnected) {
                res.status(200).json({ status: 'READY' });
            } else {
                res.status(503).json({ status: 'NOT_READY' });
            }
        });

        app.get('/', (req: Request, res: Response) => {
            res.json({ message: 'Welcome to Eurusys Auth Service 🛡️', docs: '/docs' });
        });

        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`[auth-service]: Server is running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('[auth-service]: Startup failed:', error);
    }
};

startServer();
