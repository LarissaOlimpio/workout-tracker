import { VideoRating } from '../types/video-rating.enum.js';

export class RecommendationResponseDto {
  videos!: {
    id: string;
    youtubeId: string;
    title: string;
    channel: string;
    durationSeconds: number;
    myFeedback: VideoRating | null;
  }[];
}
