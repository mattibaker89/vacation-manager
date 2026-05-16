import 'reflect-metadata';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { app } from '../index';
import { User } from '../entity/User';
import { VacationRequest } from '../entity/VacationRequest';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

let requesterId: number;
let validatorId: number;
let requesterToken: string;
let validatorToken: string;

function makeToken(userId: number, role: string) {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: '1h' });
}

beforeAll(async () => {
  await AppDataSource.initialize();
  // TRUNCATE both tables together so the FK constraint doesn't block clearing users
  await AppDataSource.query('TRUNCATE TABLE vacation_requests, users RESTART IDENTITY CASCADE');

  const password = await bcrypt.hash('test1234', 10);
  const [requester, validator] = await AppDataSource.getRepository(User).save([
    { name: 'Test Requester', role: 'Requester', password },
    { name: 'Test Validator', role: 'Validator', password },
  ]);
  requesterId = requester.id;
  validatorId = validator.id;
  requesterToken = makeToken(requesterId, 'Requester');
  validatorToken = makeToken(validatorId, 'Validator');
});

afterAll(async () => {
  await AppDataSource.query('TRUNCATE TABLE vacation_requests, users RESTART IDENTITY CASCADE');
  await AppDataSource.destroy();
});

describe('POST /api/auth/login', () => {
  it('returns a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ name: 'Test Requester', password: 'test1234' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('Requester');
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ name: 'Test Requester', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for unknown user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ name: 'Nobody', password: 'test1234' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/requests', () => {
  it('creates a vacation request', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        startDate: '2026-07-01',
        endDate: '2026-07-10',
        reason: 'Holiday',
      });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('Pending');
    expect(res.body.user.id).toBe(requesterId);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/requests').send({
      startDate: '2026-07-01',
      endDate: '2026-07-10',
    });
    expect(res.status).toBe(401);
  });

  it('returns 400 when startDate is missing', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ endDate: '2026-07-10' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when endDate is before startDate', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ startDate: '2026-07-10', endDate: '2026-07-01' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/requests', () => {
  it('returns all requests for a Validator', async () => {
    const res = await request(app)
      .get('/api/requests')
      .set('Authorization', `Bearer ${validatorToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns only own requests for a Requester', async () => {
    const res = await request(app)
      .get('/api/requests')
      .set('Authorization', `Bearer ${requesterToken}`);
    expect(res.status).toBe(200);
    res.body.forEach((r: VacationRequest) => expect(r.user.id).toBe(requesterId));
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/requests');
    expect(res.status).toBe(401);
  });

  it('filters by status', async () => {
    const res = await request(app)
      .get('/api/requests?status=Pending')
      .set('Authorization', `Bearer ${validatorToken}`);
    expect(res.status).toBe(200);
    res.body.forEach((r: VacationRequest) => expect(r.status).toBe('Pending'));
  });
});

describe('PATCH /api/requests/:id', () => {
  let reqId: number;

  beforeEach(async () => {
    const created = await AppDataSource.getRepository(VacationRequest).save({
      user: { id: requesterId },
      startDate: '2026-08-01',
      endDate: '2026-08-05',
      status: 'Pending',
    });
    reqId = created.id;
  });

  it('approves a pending request (Validator)', async () => {
    const res = await request(app)
      .patch(`/api/requests/${reqId}`)
      .set('Authorization', `Bearer ${validatorToken}`)
      .send({ status: 'Approved' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Approved');
  });

  it('rejects a pending request with a comment (Validator)', async () => {
    const res = await request(app)
      .patch(`/api/requests/${reqId}`)
      .set('Authorization', `Bearer ${validatorToken}`)
      .send({ status: 'Rejected', comments: 'Team at full capacity' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Rejected');
    expect(res.body.comments).toBe('Team at full capacity');
  });

  it('returns 403 when a Requester tries to approve', async () => {
    const res = await request(app)
      .patch(`/api/requests/${reqId}`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ status: 'Approved' });
    expect(res.status).toBe(403);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app)
      .patch(`/api/requests/${reqId}`)
      .send({ status: 'Approved' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when rejecting without a comment', async () => {
    const res = await request(app)
      .patch(`/api/requests/${reqId}`)
      .set('Authorization', `Bearer ${validatorToken}`)
      .send({ status: 'Rejected' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid status', async () => {
    const res = await request(app)
      .patch(`/api/requests/${reqId}`)
      .set('Authorization', `Bearer ${validatorToken}`)
      .send({ status: 'Cancelled' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown request id', async () => {
    const res = await request(app)
      .patch('/api/requests/99999')
      .set('Authorization', `Bearer ${validatorToken}`)
      .send({ status: 'Approved' });
    expect(res.status).toBe(404);
  });
});
