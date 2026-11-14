import { IsEnum } from 'class-validator';
import { VideoRating } from '../types/video-rating.enum.js';

export class VideoFeedbackDto {
  @IsEnum(VideoRating)
  rating!: VideoRating;
}
