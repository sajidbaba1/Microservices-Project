import { Kafka, Producer } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'auth-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

let producer: Producer;

export const initKafka = async () => {
    producer = kafka.producer();
    try {
        await producer.connect();
        console.log('[auth-service]: Kafka Producer connected 📨');
    } catch (error) {
        console.error('[auth-service]: Kafka connection failed:', error);
    }
};

export const emitEvent = async (topic: string, message: any) => {
    if (!producer) {
        console.warn('[auth-service]: Kafka Producer not initialized');
        return;
    }

    try {
        await producer.send({
            topic,
            messages: [
                { value: JSON.stringify(message) },
            ],
        });
        console.log(`[auth-service]: Event emitted to ${topic}`);
    } catch (error) {
        console.error(`[auth-service]: Failed to emit event to ${topic}:`, error);
    }
};
