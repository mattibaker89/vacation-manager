import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';
import { requireAuth } from '../middleware/auth';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      res.status(400).json({ message: 'name and password are required' });
      return;
    }

    // `select: false` on password means we must explicitly request it
    const user = await AppDataSource.getRepository(User)
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.name = :name', { name })
      .getOne();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await AppDataSource.getRepository(User).findOneBy({ id: req.auth!.sub });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ id: user.id, name: user.name, role: user.role });
  } catch (err) {
    next(err);
  }
});

export default router;
