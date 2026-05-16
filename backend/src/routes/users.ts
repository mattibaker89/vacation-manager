import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';
import { requireAuth, requireValidator } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (_req: Request, res: Response) => {
  const users = await AppDataSource.getRepository(User).find();
  res.json(users);
});

router.post('/', requireValidator, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, role, password } = req.body;

    if (!name?.trim()) {
      res.status(400).json({ error: 'name is required' });
      return;
    }
    if (!['Requester', 'Validator'].includes(role)) {
      res.status(400).json({ error: 'role must be Requester or Validator' });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'password must be at least 6 characters' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await AppDataSource.getRepository(User).save({
      name: name.trim(),
      role,
      password: hashed,
    });

    const { password: _, ...safeUser } = user as User & { password: string };
    res.status(201).json(safeUser);
  } catch (err) {
    next(err);
  }
});

export default router;
