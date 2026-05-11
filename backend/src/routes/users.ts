import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const users = await AppDataSource.getRepository(User).find();
  res.json(users);
});

export default router;
