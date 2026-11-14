import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileService } from '../user/profile/user-profile.service.js';
import { ProfileEquipment } from '../user/profile/types/user-profile.enums.js';
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
    const likedVideos = videos.filter(
      (video) => feedbackByVideo.get(video.id) === VideoRating.Like,
    );

    const recommended = videos
      .filter((video) => {
        if (feedbackByVideo.get(video.id) === VideoRating.Dislike) return false;
        if (!video.goals.includes(profile.goal) || !video.levels.includes(profile.level)) {
          return false;
        }
        return (
          video.equipment.length === 0 ||
          (!profile.equipment.includes(ProfileEquipment.None) &&
            video.equipment.every((item) => profile.equipment.includes(item)))
        );
      })
      .sort((left, right) => {
        const leftRating = feedbackByVideo.get(left.id) === VideoRating.Like;
        const rightRating = feedbackByVideo.get(right.id) === VideoRating.Like;
        if (leftRating !== rightRating) return leftRating ? -1 : 1;
        const leftSharedTags = likedVideos.reduce(
          (count, liked) => count + this.sharedTagCount(left, liked),
          0,
        );
        const rightSharedTags = likedVideos.reduce(
          (count, liked) => count + this.sharedTagCount(right, liked),
          0,
        );
        return rightSharedTags - leftSharedTags;
      });

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

  private sharedTagCount(left: Video, right: Video): number {
    return (
      left.goals.filter((tag) => right.goals.includes(tag)).length +
      left.levels.filter((tag) => right.levels.includes(tag)).length +
      left.equipment.filter((tag) => right.equipment.includes(tag)).length
    );
  }
}
