import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { VacationRequest } from '../entity/VacationRequest';
import { User } from '../entity/User';
import { requireAuth, requireValidator } from '../middleware/auth';

const router = Router();

// POST /api/requests — Requester submits a vacation request; userId comes from JWT
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const userId = req.auth!.sub;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      res.status(400).json({ error: 'endDate must be on or after startDate' });
      return;
    }

    const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const request = AppDataSource.getRepository(VacationRequest).create({
      user,
      startDate,
      endDate,
      reason: reason || null,
      status: 'Pending',
    });

    const saved = await AppDataSource.getRepository(VacationRequest).save(request);
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

// GET /api/requests — Validators see all; Requesters see only their own
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const repo = AppDataSource.getRepository(VacationRequest);
    const { status } = req.query;
    const { sub: userId, role } = req.auth!;

    const qb = repo.createQueryBuilder('vr').leftJoinAndSelect('vr.user', 'user');

    if (role !== 'Validator') {
      qb.andWhere('user.id = :userId', { userId });
    }
    if (status) {
      qb.andWhere('vr.status = :status', { status });
    }

    qb.orderBy('vr.created_at', 'DESC');
    const results = await qb.getMany();
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/requests/:id — approve or reject (Validators only)
router.patch('/:id', requireValidator, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, comments } = req.body;
    const id = Number(req.params.id);

    if (!['Approved', 'Rejected'].includes(status)) {
      res.status(400).json({ error: 'status must be Approved or Rejected' });
      return;
    }

    if (status === 'Rejected' && !comments?.trim()) {
      res.status(400).json({ error: 'A comment is required when rejecting a request' });
      return;
    }

    const repo = AppDataSource.getRepository(VacationRequest);
    const vacationRequest = await repo.findOne({ where: { id }, relations: ['user'] });

    if (!vacationRequest) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    // 409 Conflict: prevent double-actioning an already-decided request
    if (vacationRequest.status !== 'Pending') {
      res.status(409).json({ error: 'Only Pending requests can be updated' });
      return;
    }

    vacationRequest.status = status;
    vacationRequest.comments = comments || null;

    const updated = await repo.save(vacationRequest);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
