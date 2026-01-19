import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { apiReference } from '@scalar/express-api-reference';
import { initClickHouse, clickhouse } from './config/clickhouse';
import { startAnalyticsConsumer } from './consumers/eventConsumer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// --- Infrastructure Initialization ---
const startServer = async () => {
    try {
        await initClickHouse();
        await startAnalyticsConsumer();

        // --- API Documentation (Scalar) ---
        app.use(
            '/docs',
            apiReference({
                spec: {
                    content: {
                        openapi: '3.1.0',
                        info: {
                            title: 'Eurusys Analytics Service API',
                            version: '1.0.0',
                            description: 'High-speed event analytics API based on ClickHouse.',
                        },
                        paths: {
                            '/api/analytics/stats': {
                                get: {
                                    summary: 'Get event distribution statistics',
                                    tags: ['Analytics'],
                                    responses: {
                                        '200': {
                                            description: 'Stats retrieved',
                                            content: {
                                                'application/json': {
                                                    schema: {
                                                        type: 'object',
                                                        properties: {
                                                            success: { type: 'boolean' },
                                                            data: { type: 'array' }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }),
        );

        // --- API Routes ---
        app.get('/api/analytics/stats', async (req: Request, res: Response) => {
            try {
                const resultSet = await clickhouse.query({
                    query: 'SELECT event_type, count() as count FROM user_events GROUP BY event_type',
                    format: 'JSONEachRow',
                });
                const dataset = await resultSet.json();
                res.json({ success: true, data: dataset });
            } catch (error) {
                res.status(500).json({ success: false, error: 'Failed to fetch stats' });
            }
        });

        app.get('/health/live', (req: Request, res: Response) => {
            res.status(200).json({ status: 'UP' });
        });

        app.get('/', (req: Request, res: Response) => {
            res.json({ message: 'Welcome to Eurusys Analytics Service 📊', docs: '/docs' });
        });

        app.listen(PORT, () => {
            console.log(`[analytics-service]: Server is running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('[analytics-service]: Startup failed:', error);
    }
};

startServer();
