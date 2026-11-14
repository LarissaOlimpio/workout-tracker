import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { UserProfile } from '../user/profile/user-profile.entity.js';
import { ProfileGoal } from '../user/profile/types/user-profile.enums.js';
import { CreateMeasurementDto } from './dto/create-measurement.dto.js';
import { Measurement } from './measurement.entity.js';
import { MeasurementService } from './measurement.service.js';

describe('MeasurementService', () => {
  let service: MeasurementService;
  let moduleRef: TestingModule;
  let dataSource: { transaction: ReturnType<typeof vi.fn> };
  let measurementRepo: {
    create: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let profileRepo: {
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };

  const userId = 'a4360fd3-3448-4f4c-a18e-1410c91940bd';
  const profile = (): UserProfile =>
    ({
      userId,
      goal: ProfileGoal.GainMuscle,
      weightKg: 70,
      chestCm: 95,
      waistCm: 80,
      hipCm: 100,
    }) as UserProfile;

  beforeEach(async () => {
    measurementRepo = {
      create: vi.fn((data) => ({ ...data })),
      findOne: vi.fn(),
      save: vi.fn(async (measurement) => measurement),
    };
    profileRepo = {
      findOne: vi.fn(),
      save: vi.fn(async (entity) => entity),
    };
    const manager = {
      getRepository: vi.fn((entity: unknown) =>
        entity === Measurement ? measurementRepo : profileRepo,
      ),
    };
    dataSource = {
      transaction: vi.fn((callback) => callback(manager)),
    };

    moduleRef = await Test.createTestingModule({
      providers: [
        MeasurementService,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();
    service = moduleRef.get(MeasurementService);
  });

  afterEach(async () => moduleRef.close());

  it('upserts the date and synchronizes supplied fields to the latest profile in one transaction', async () => {
    const measuredAt = new Date().toISOString().slice(0, 10);
    const existingMeasurement = {
      userId,
      measuredAt,
      weightKg: 70,
      chestCm: 95,
      waistCm: 80,
      hipCm: 100,
    } as Measurement;
    const userProfile = profile();
    profileRepo.findOne.mockResolvedValue(userProfile);
    measurementRepo.findOne
      .mockResolvedValueOnce(existingMeasurement)
      .mockResolvedValueOnce(existingMeasurement);

    const result = await service.upsertForUser(userId, {
      measuredAt,
      weightKg: 72.5,
      waistCm: 82,
    } as CreateMeasurementDto);

    expect(dataSource.transaction).toHaveBeenCalledOnce();
    expect(result).toMatchObject({
      userId,
      measuredAt,
      weightKg: 72.5,
      chestCm: 95,
      waistCm: 82,
      hipCm: 100,
    });
    expect(userProfile).toMatchObject({ weightKg: 72.5, waistCm: 82 });
    expect(profileRepo.save).toHaveBeenCalledWith(userProfile);
  });

  it('does not change the profile for an upsert older than the latest measurement', async () => {
    const latestDate = new Date();
    latestDate.setUTCDate(latestDate.getUTCDate() - 1);
    const submittedDate = new Date(latestDate);
    submittedDate.setUTCDate(submittedDate.getUTCDate() - 1);
    const latestDateString = latestDate.toISOString().slice(0, 10);
    const submittedDateString = submittedDate.toISOString().slice(0, 10);
    profileRepo.findOne.mockResolvedValue(profile());
    measurementRepo.findOne
      .mockResolvedValueOnce({ measuredAt: latestDateString })
      .mockResolvedValueOnce(null);

    await service.upsertForUser(userId, {
      measuredAt: submittedDateString,
      weightKg: 69,
    } as CreateMeasurementDto);

    expect(measurementRepo.save).toHaveBeenCalledOnce();
    expect(profileRepo.save).not.toHaveBeenCalled();
  });

  it('returns 404 when the user has no profile', async () => {
    profileRepo.findOne.mockResolvedValue(null);

    await expect(
      service.upsertForUser(userId, { weightKg: 70 } as CreateMeasurementDto),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(measurementRepo.save).not.toHaveBeenCalled();
  });
});
