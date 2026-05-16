import 'reflect-metadata';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { AppDataSource } from './config/database';
import { User } from './entity/User';

dotenv.config();

export async function seedIfEmpty(): Promise<void> {
  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.count();
  if (existing > 0) return;

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  await userRepo.save([
    { name: 'Alice Martin', role: 'Requester', password: await hash('alice123') },
    { name: 'Bob Smith', role: 'Requester', password: await hash('bob123') },
    { name: 'Carol Jones', role: 'Validator', password: await hash('carol123') },
  ]);

  console.log('Seeded: 2 Requesters, 1 Validator');
}

// require.main guard lets this file act as both an importable function (called
// from index.ts on startup) and a standalone CLI script (pnpm seed).
if (require.main === module) {
  AppDataSource.initialize()
    .then(seedIfEmpty)
    .then(() => AppDataSource.destroy())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
