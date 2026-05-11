import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { seedIfEmpty } from './seed';
import requestsRouter from './routes/requests';
import usersRouter from './routes/users';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/requests', requestsRouter);
app.use('/api/users', usersRouter);

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;

AppDataSource.initialize()
  .then(seedIfEmpty)
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
