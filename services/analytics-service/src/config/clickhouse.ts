import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';

dotenv.config();

export const clickhouse = createClient({
    host: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
    database: 'default',
});

export const initClickHouse = async () => {
    try {
        // Create an analytics table if it doesn't exist
        // QA Note: Using MergeTree for high-performance OLAP storage
        await clickhouse.command({
            query: `
                CREATE TABLE IF NOT EXISTS user_events (
                    event_type String,
                    user_id String,
                    email String,
                    timestamp DateTime,
                    date Date DEFAULT toDate(timestamp)
                ) ENGINE = MergeTree()
                ORDER BY (date, event_type, user_id)
            `,
        });
        console.log('[analytics-service]: ClickHouse initialized (user_events table ready) 📊');
    } catch (error) {
        console.error('[analytics-service]: ClickHouse connection failed:', error);
    }
};
