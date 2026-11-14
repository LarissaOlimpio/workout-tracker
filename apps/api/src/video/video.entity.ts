import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  ProfileEquipment,
  ProfileGoal,
  ProfileLevel,
} from '../user/profile/types/user-profile.enums.js';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  youtubeId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255 })
  channel!: string;

  @Column({ type: 'integer' })
  durationSeconds!: number;

  @Column({
    type: 'enum',
    enum: ProfileGoal,
    enumName: 'user_profiles_goal_enum',
    array: true,
  })
  goals!: ProfileGoal[];

  @Column({
    type: 'enum',
    enum: ProfileLevel,
    enumName: 'user_profiles_level_enum',
    array: true,
  })
  levels!: ProfileLevel[];

  @Column({
    type: 'enum',
    enum: ProfileEquipment,
    enumName: 'user_profiles_equipment_enum',
    array: true,
  })
  equipment!: ProfileEquipment[];
}
