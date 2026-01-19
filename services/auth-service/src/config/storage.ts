import * as Minio from 'minio';
import dotenv from 'dotenv';

dotenv.config();

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9010'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
    secretKey: process.env.MINIO_SECRET_KEY || 'password',
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'profiles';

export const initStorage = async () => {
    try {
        const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
        if (!bucketExists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
            console.log(`[auth-service]: Created MinIO bucket: ${BUCKET_NAME} 📦`);

            // Set public read policy for the bucket
            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: ['s3:GetBucketLocation', 's3:ListBucket'],
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Resource: [`arn:aws:s3:::${BUCKET_NAME}`],
                    },
                    {
                        Action: ['s3:GetObject'],
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
                    },
                ],
            };
            await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
            console.log(`[auth-service]: Set public read policy for bucket: ${BUCKET_NAME} 🔓`);
        } else {
            console.log(`[auth-service]: MinIO bucket ${BUCKET_NAME} already exists 📦`);
        }
    } catch (error) {
        console.error('[auth-service]: Storage initialization failed:', error);
    }
};
