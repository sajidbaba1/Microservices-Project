import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'eurusys_db',
    synchronize: process.env.NODE_ENV === 'development', // QA Note: Use migrations for production!
    logging: process.env.NODE_ENV === 'development',
    entities: [User],
    subscribers: [],
    migrations: [],
});
