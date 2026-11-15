import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserProfileService } from '../user/profile/user-profile.service.js';
import {
  ProfileEquipment,
  ProfileGoal,
  ProfileLevel,
} from '../user/profile/types/user-profile.enums.js';
import { VideoFeedbackDto } from './dto/video-feedback.dto.js';
import { VideoFeedback } from './video-feedback.entity.js';
import { Video } from './video.entity.js';
import { VideoRating } from './types/video-rating.enum.js';
import { VideoService } from './video.service.js';

describe('VideoService', () => {
  let service: VideoService;
  let moduleRef: TestingModule;
  let videoRepo: {
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };
  let feedbackRepo: {
    create: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let profileService: { findForUser: ReturnType<typeof vi.fn> };

  const userId = 'a4360fd3-3448-4f4c-a18e-1410c91940bd';
  const makeVideo = (id: string, overrides: Partial<Video> = {}): Video =>
    ({
      id,
      youtubeId: `youtube-${id}`,
      title: `Video ${id}`,
      channel: 'Train Up',
      durationSeconds: 1800,
      goals: [ProfileGoal.LoseWeight],
      levels: [ProfileLevel.Beginner],
      equipment: [],
      ...overrides,
    }) as Video;
  const profile = {
    goal: ProfileGoal.LoseWeight,
    level: ProfileLevel.Beginner,
    daysPerWeek: 3,
    equipment: [ProfileEquipment.Dumbbells],
  };

  beforeEach(async () => {
    videoRepo = { find: vi.fn(), findOne: vi.fn() };
    feedbackRepo = {
      create: vi.fn((value) => ({ ...value })),
      find: vi.fn(),
      findOne: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    profileService = { findForUser: vi.fn() };
    moduleRef = await Test.createTestingModule({
      providers: [
        VideoService,
        { provide: getRepositoryToken(Video), useValue: videoRepo },
        { provide: getRepositoryToken(VideoFeedback), useValue: feedbackRepo },
        { provide: UserProfileService, useValue: profileService },
      ],
    }).compile();
    service = moduleRef.get(VideoService);
  });

  afterEach(async () => moduleRef.close());

  it('scores profile matches, filters unavailable equipment and dislikes, and ranks likes first', async () => {
    profileService.findForUser.mockResolvedValue(profile);
    const liked = makeVideo('liked', {
      equipment: [ProfileEquipment.Dumbbells],
    });
    const similar = makeVideo('similar', {
      equipment: [ProfileEquipment.Dumbbells],
    });
    const noGear = makeVideo('no-gear');
    const wrongGoal = makeVideo('goal', { goals: [ProfileGoal.GainMuscle] });
    const wrongLevel = makeVideo('level', { levels: [ProfileLevel.Advanced] });
    const unavailable = makeVideo('gear', {
      equipment: [ProfileEquipment.Treadmill],
    });
    const disliked = makeVideo('disliked');
    videoRepo.find.mockResolvedValue([
      noGear,
      wrongGoal,
      wrongLevel,
      unavailable,
      disliked,
      similar,
      liked,
    ]);
    feedbackRepo.find.mockResolvedValue([
      { videoId: 'liked', rating: VideoRating.Like },
      { videoId: 'disliked', rating: VideoRating.Dislike },
    ]);

    const result = await service.getRecommendations(userId);

    expect(result.videos.map((video) => video.id)).toEqual([
      'liked',
      'no-gear',
      'similar',
      'level',
      'goal',
    ]);
    expect(result.videos[0].myFeedback).toBe(VideoRating.Like);
    expect(profileService.findForUser).toHaveBeenCalledWith(userId);
  });

  it('returns up to eight compatible videos even when none match the profile tags', async () => {
    profileService.findForUser.mockResolvedValue(profile);
    videoRepo.find.mockResolvedValue(Array.from({ length: 10 }, (_, index) =>
      makeVideo(`v${index}`, {
        goals: [ProfileGoal.GainMuscle],
        levels: [ProfileLevel.Advanced],
      }),
    ));
    feedbackRepo.find.mockResolvedValue([]);

    const result = await service.getRecommendations(userId);

    expect(result.videos).toHaveLength(8);
  });

  it('persists feedback for an existing video and updates an existing row', async () => {
    videoRepo.findOne.mockResolvedValue(makeVideo('one'));
    const existing = { userId, videoId: 'one', rating: VideoRating.Like } as VideoFeedback;
    feedbackRepo.findOne.mockResolvedValue(existing);
    feedbackRepo.save.mockImplementation(async (row) => row);
    const dto = { rating: VideoRating.Dislike } as VideoFeedbackDto;

    await expect(service.setFeedback(userId, 'one', dto)).resolves.toEqual({
      rating: VideoRating.Dislike,
    });
    expect(feedbackRepo.create).not.toHaveBeenCalled();
    expect(feedbackRepo.save).toHaveBeenCalledWith({
      ...existing,
      rating: VideoRating.Dislike,
    });
  });

  it('rejects feedback for an unknown video', async () => {
    videoRepo.findOne.mockResolvedValue(null);

    await expect(
      service.setFeedback(userId, 'missing', { rating: VideoRating.Like }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(feedbackRepo.save).not.toHaveBeenCalled();
  });

  it('clears only the requesting user feedback for the selected video', async () => {
    await service.clearFeedback(userId, 'one');

    expect(feedbackRepo.delete).toHaveBeenCalledWith({ userId, videoId: 'one' });
  });
});
