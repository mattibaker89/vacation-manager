import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { VacationRequest } from './VacationRequest';
import type { UserRole } from '../types';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'varchar' })
  role!: UserRole;

  @Column({ select: false })
  password!: string;

  @OneToMany(() => VacationRequest, (req) => req.user)
  vacationRequests!: VacationRequest[];
}
