import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { User } from './entity/User';

dotenv.config();

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);

  const existing = await userRepo.count();
  if (existing > 0) {
    console.log('Users already seeded, skipping.');
    await AppDataSource.destroy();
    return;
  }

  await userRepo.save([
    { name: 'Alice Martin', role: 'Requester' },
    { name: 'Bob Smith', role: 'Requester' },
    { name: 'Carol Jones', role: 'Validator' },
  ]);

  console.log('Seeded: 2 Requesters, 1 Validator');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
