import 'reflect-metadata';
import request from 'supertest';
import { AppDataSource } from '../config/database';
import { app } from '../index';
import { User } from '../entity/User';
import { VacationRequest } from '../entity/VacationRequest';

let requesterId: number;
let validatorId: number;

beforeAll(async () => {
  await AppDataSource.initialize();
  await AppDataSource.getRepository(VacationRequest).delete({});
  await AppDataSource.getRepository(User).delete({});

  const [requester, validator] = await AppDataSource.getRepository(User).save([
    { name: 'Test Requester', role: 'Requester' },
    { name: 'Test Validator', role: 'Validator' },
  ]);
  requesterId = requester.id;
  validatorId = validator.id;
});

afterAll(async () => {
  await AppDataSource.getRepository(VacationRequest).delete({});
  await AppDataSource.getRepository(User).delete({});
  await AppDataSource.destroy();
});

describe('POST /api/requests', () => {
  it('creates a vacation request', async () => {
    const res = await request(app).post('/api/requests').send({
      userId: requesterId,
      startDate: '2026-07-01',
      endDate: '2026-07-10',
      reason: 'Holiday',
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('Pending');
    expect(res.body.user.id).toBe(requesterId);
  });

  it('returns 400 when startDate is missing', async () => {
    const res = await request(app).post('/api/requests').send({
      userId: requesterId,
      endDate: '2026-07-10',
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when endDate is before startDate', async () => {
    const res = await request(app).post('/api/requests').send({
      userId: requesterId,
      startDate: '2026-07-10',
      endDate: '2026-07-01',
    });
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown userId', async () => {
    const res = await request(app).post('/api/requests').send({
      userId: 99999,
      startDate: '2026-07-01',
      endDate: '2026-07-05',
    });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/requests', () => {
  it('returns all requests', async () => {
    const res = await request(app).get('/api/requests');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('filters by userId', async () => {
    const res = await request(app).get(`/api/requests?userId=${requesterId}`);
    expect(res.status).toBe(200);
    res.body.forEach((r: VacationRequest) => expect(r.user.id).toBe(requesterId));
  });

  it('filters by status', async () => {
    const res = await request(app).get('/api/requests?status=Pending');
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

  it('approves a pending request', async () => {
    const res = await request(app).patch(`/api/requests/${reqId}`).send({ status: 'Approved' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Approved');
  });

  it('rejects a pending request with a comment', async () => {
    const res = await request(app)
      .patch(`/api/requests/${reqId}`)
      .send({ status: 'Rejected', comments: 'Team at full capacity' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Rejected');
    expect(res.body.comments).toBe('Team at full capacity');
  });

  it('returns 400 when rejecting without a comment', async () => {
    const res = await request(app).patch(`/api/requests/${reqId}`).send({ status: 'Rejected' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid status', async () => {
    const res = await request(app).patch(`/api/requests/${reqId}`).send({ status: 'Cancelled' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown request id', async () => {
    const res = await request(app).patch('/api/requests/99999').send({ status: 'Approved' });
    expect(res.status).toBe(404);
  });
});
