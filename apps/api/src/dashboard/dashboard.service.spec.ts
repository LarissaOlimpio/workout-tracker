import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Measurement } from '../measurement/measurement.entity.js';
import { ProfileGoal } from '../user/profile/types/user-profile.enums.js';
import { UserProfile } from '../user/profile/user-profile.entity.js';
import { DashboardService } from './dashboard.service.js';

describe('DashboardService', () => {
  let service: DashboardService;
  let moduleRef: TestingModule;
  let profileRepo: {
    findOne: ReturnType<typeof vi.fn>;
  };
  let measurementRepo: {
    create: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };

  const userId = 'a4360fd3-3448-4f4c-a18e-1410c91940bd';
  const profile = (overrides: Partial<UserProfile> = {}): UserProfile =>
    ({
      userId,
      goal: ProfileGoal.LoseWeight,
      daysPerWeek: 4,
      heightCm: 170,
      weightKg: 70,
      targetWeightKg: 60,
      chestCm: 98,
      waistCm: 80,
      hipCm: 100,
      ...overrides,
    }) as UserProfile;
  const measurement = (
    date: string,
    weightKg: number,
    overrides: Partial<Measurement> = {},
  ): Measurement =>
    ({
      id: date,
      userId,
      measuredAt: date,
      weightKg,
      chestCm: null,
      waistCm: null,
      hipCm: null,
      ...overrides,
    }) as Measurement;

  beforeEach(async () => {
    profileRepo = { findOne: vi.fn() };
    measurementRepo = {
      create: vi.fn((data) => ({ ...data })),
      find: vi.fn(),
      save: vi.fn(async (entity) => entity),
    };
    moduleRef = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(UserProfile), useValue: profileRepo },
        { provide: getRepositoryToken(Measurement), useValue: measurementRepo },
      ],
    }).compile();
    service = moduleRef.get(DashboardService);
  });

  afterEach(async () => moduleRef.close());

  it('returns 404 when no profile exists', async () => {
    profileRepo.findOne.mockResolvedValue(null);

    await expect(service.getForUser(userId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(measurementRepo.find).not.toHaveBeenCalled();
  });

  it('seeds the initial measurement for a legacy profile and returns dashboard metrics', async () => {
    const userProfile = profile();
    profileRepo.findOne.mockResolvedValue(userProfile);
    measurementRepo.find.mockResolvedValue([]);

    const result = await service.getForUser(userId);

    expect(measurementRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        weightKg: userProfile.weightKg,
        chestCm: userProfile.chestCm,
        waistCm: userProfile.waistCm,
        hipCm: userProfile.hipCm,
      }),
    );
    expect(result.weight).toEqual({
      currentKg: 70,
      startKg: 70,
      deltaKg: 0,
      targetKg: 60,
      progressPct: 0,
    });
    expect(result.bmi).toEqual({ value: 24.2, category: 'normal' });
    expect(result.training).toEqual({ goalPerWeek: 4, currentPerWeek: null });
    expect(result.history).toHaveLength(1);
  });

  it('uses the all-time start, six-month series and newest-first ten-entry history', async () => {
    profileRepo.findOne.mockResolvedValue(profile({
      heightCm: 175,
      targetWeightKg: 65,
    }));
    const today = new Date();
    const recent = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - (11 - index) * 10);
      return measurement(date.toISOString().slice(0, 10), 79 - index, {
        chestCm: 100 - index,
        waistCm: 90 - index,
        hipCm: 105 - index,
      });
    });
    measurementRepo.find.mockResolvedValue([
      measurement('1970-01-01', 80),
      ...recent,
    ]);

    const result = await service.getForUser(userId);

    expect(result.weight).toEqual({
      currentKg: 68,
      startKg: 80,
      deltaKg: -12,
      targetKg: 65,
      progressPct: 80,
    });
    expect(result.bmi).toEqual({ value: 22.2, category: 'normal' });
    expect(result.weightSeries).toHaveLength(12);
    expect(result.measurementSeries).toHaveLength(12);
    expect(result.history).toHaveLength(10);
    expect(result.history[0].date).toBe(recent[11].measuredAt);
    expect(result.history[9].date).toBe(recent[2].measuredAt);
  });
});
