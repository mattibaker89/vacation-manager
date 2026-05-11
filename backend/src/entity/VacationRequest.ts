import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

@Entity('vacation_requests')
export class VacationRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.vacationRequests, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'date' })
  startDate!: string;

  @Column({ type: 'date' })
  endDate!: string;

  @Column({ nullable: true, type: 'text' })
  reason!: string | null;

  @Column({ type: 'varchar', default: 'Pending' })
  status!: RequestStatus;

  @Column({ nullable: true, type: 'text' })
  comments!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
