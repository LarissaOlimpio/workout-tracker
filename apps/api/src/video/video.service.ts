import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileResponseDto } from '../user/profile/dto/user-profile-response.dto.js';
import { UserProfileService } from '../user/profile/user-profile.service.js';
import { RecommendationResponseDto } from './dto/recommendation-response.dto.js';
import { VideoFeedbackDto } from './dto/video-feedback.dto.js';
import { VideoFeedback } from './video-feedback.entity.js';
import { Video } from './video.entity.js';
import { VideoRating } from './types/video-rating.enum.js';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
    @InjectRepository(VideoFeedback)
    private readonly feedbackRepo: Repository<VideoFeedback>,
    private readonly userProfileService: UserProfileService,
  ) {}

  async getRecommendations(userId: string): Promise<RecommendationResponseDto> {
    const profile = await this.userProfileService.findForUser(userId);
    const [videos, feedback] = await Promise.all([
      this.videoRepo.find(),
      this.feedbackRepo.find({ where: { userId } }),
    ]);
    const feedbackByVideo = new Map(feedback.map((item) => [item.videoId, item.rating]));
    const recommended = videos
      .filter((video) => {
        if (feedbackByVideo.get(video.id) === VideoRating.Dislike) return false;
        return (
          video.equipment.length === 0 ||
          video.equipment.every((item) => profile.equipment.includes(item))
        );
      })
      .sort((left, right) => {
        const leftRating = feedbackByVideo.get(left.id) === VideoRating.Like;
        const rightRating = feedbackByVideo.get(right.id) === VideoRating.Like;
        if (leftRating !== rightRating) return leftRating ? -1 : 1;
        return this.score(right, profile) - this.score(left, profile);
      })
      .slice(0, 8);

    return {
      videos: recommended.map((video) => ({
        id: video.id,
        youtubeId: video.youtubeId,
        title: video.title,
        channel: video.channel,
        durationSeconds: video.durationSeconds,
        myFeedback: feedbackByVideo.get(video.id) ?? null,
      })),
    };
  }

  async setFeedback(
    userId: string,
    videoId: string,
    dto: VideoFeedbackDto,
  ): Promise<{ rating: VideoRating }> {
    const video = await this.videoRepo.findOne({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');

    const existing = await this.feedbackRepo.findOne({
      where: { userId, videoId },
    });
    const feedback = existing ?? this.feedbackRepo.create({ userId, videoId });
    feedback.rating = dto.rating;
    await this.feedbackRepo.save(feedback);
    return { rating: feedback.rating };
  }

  async clearFeedback(userId: string, videoId: string): Promise<void> {
    await this.feedbackRepo.delete({ userId, videoId });
  }

  private score(video: Video, profile: UserProfileResponseDto): number {
    return (video.goals.includes(profile.goal) ? 2 : 0) +
      (video.levels.includes(profile.level) ? 1 : 0);
  }
}
