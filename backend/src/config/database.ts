import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { VacationRequest } from '../entity/VacationRequest';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vacation_manager',
  // synchronize: true auto-applies entity schema on startup — dev only.
  // Replace with TypeORM migrations before deploying to production.
  synchronize: true,
  logging: false,
  entities: [User, VacationRequest],
});
