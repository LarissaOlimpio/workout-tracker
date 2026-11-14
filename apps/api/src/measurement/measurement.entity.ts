import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../user/user.entity.js';

@Entity('body_measurements')
@Unique('UQ_body_measurements_user_date', ['userId', 'measuredAt'])
export class Measurement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'date' })
  measuredAt!: string;

  @Column({ type: 'double precision' })
  weightKg!: number;

  @Column({ type: 'double precision', nullable: true })
  chestCm!: number | null;

  @Column({ type: 'double precision', nullable: true })
  waistCm!: number | null;

  @Column({ type: 'double precision', nullable: true })
  hipCm!: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
