import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { VacationRequest } from './VacationRequest';

export type UserRole = 'Requester' | 'Validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'varchar' })
  role!: UserRole;

  @OneToMany(() => VacationRequest, (req) => req.user)
  vacationRequests!: VacationRequest[];
}
