import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { VideoRating } from './types/video-rating.enum.js';

@Entity('video_feedback')
@Unique('UQ_video_feedback_user_video', ['userId', 'videoId'])
export class VideoFeedback {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  videoId!: string;

  @Column({ type: 'enum', enum: VideoRating, enumName: 'video_feedback_rating_enum' })
  rating!: VideoRating;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
