import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const users = await AppDataSource.getRepository(User).find();
  res.json(users);
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, role } = req.body;

    if (!name?.trim()) {
      res.status(400).json({ error: 'name is required' });
      return;
    }
    if (!['Requester', 'Validator'].includes(role)) {
      res.status(400).json({ error: 'role must be Requester or Validator' });
      return;
    }

    const user = await AppDataSource.getRepository(User).save({ name: name.trim(), role });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
