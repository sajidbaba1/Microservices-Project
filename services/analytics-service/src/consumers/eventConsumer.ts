import { Kafka } from 'kafkajs';
import { clickhouse } from '../config/clickhouse';
import dotenv from 'dotenv';

dotenv.config();

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'analytics-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || 'analytics-group' });

export const startAnalyticsConsumer = async () => {
    await consumer.connect();
    console.log('[analytics-service]: Kafka Consumer connected 🎧');

    // Subscribe to multiple topics
    await consumer.subscribe({ topics: ['user-registered', 'user-login'], fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            if (!message.value) return;

            const data = JSON.parse(message.value.toString());
            console.log(`[analytics-service]: Received event [${topic}]:`, data);

            try {
                // Insert into ClickHouse
                await clickhouse.insert({
                    table: 'user_events',
                    values: [{
                        event_type: topic,
                        user_id: data.userId || 'unknown',
                        email: data.email || '',
                        timestamp: data.timestamp || new Date().toISOString().replace('T', ' ').replace('Z', ''),
                    }],
                    format: 'JSONEachRow',
                });

                console.log(`[analytics-service]: Event [${topic}] persisted to ClickHouse`);
            } catch (err) {
                console.error('[analytics-service]: Error saving to ClickHouse:', err);
            }
        },
    });
};
