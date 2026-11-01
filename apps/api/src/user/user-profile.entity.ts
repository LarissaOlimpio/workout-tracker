import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity.js';
import {
  ProfileEquipment,
  ProfileGoal,
  ProfileLevel,
} from './types/user-profile.enums.js';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryColumn('uuid')
  userId!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'enum',
    enum: ProfileGoal,
    enumName: 'user_profiles_goal_enum',
  })
  goal!: ProfileGoal;

  @Column({
    type: 'enum',
    enum: ProfileLevel,
    enumName: 'user_profiles_level_enum',
  })
  level!: ProfileLevel;

  @Column({ type: 'integer' })
  daysPerWeek!: number;

  @Column({
    type: 'enum',
    enum: ProfileEquipment,
    enumName: 'user_profiles_equipment_enum',
    array: true,
  })
  equipment!: ProfileEquipment[];

  @Column({ type: 'double precision' })
  weightKg!: number;

  @Column({ type: 'double precision' })
  heightCm!: number;

  @Column({ type: 'date' })
  birthDate!: string;
}
