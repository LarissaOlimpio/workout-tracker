import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserProfileDto } from './dto/user-profile.dto.js';
import { UserProfile } from './user-profile.entity.js';
import { User } from './user.entity.js';
import { UserProfileService } from './user-profile.service.js';
import {
  ProfileEquipment,
  ProfileGoal,
  ProfileLevel,
} from './types/user-profile.enums.js';

describe('UserProfileService', () => {
  let service: UserProfileService;
  let moduleRef: TestingModule;
  let profileRepository: {
    create: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let userRepository: {
    findOne: ReturnType<typeof vi.fn>;
  };

  const userId = 'a4360fd3-3448-4f4c-a18e-1410c91940bd';
  const user = { id: userId } as User;
  const profile = (overrides: Partial<UserProfile> = {}): UserProfile =>
    ({
      userId,
      goal: ProfileGoal.GainMuscle,
      level: ProfileLevel.Intermediate,
      daysPerWeek: 4,
      equipment: [ProfileEquipment.Dumbbells, ProfileEquipment.Bench],
      weightKg: 72.5,
      heightCm: 178,
      birthDate: '1995-04-23',
      ...overrides,
    }) as UserProfile;
  const profileDto = (): UserProfileDto => ({
    goal: ProfileGoal.LoseWeight,
    level: ProfileLevel.Beginner,
    daysPerWeek: 3,
    equipment: [ProfileEquipment.ResistanceBands],
    weightKg: 68.25,
    heightCm: 170,
    birthDate: new Date('1990-06-15T00:00:00.000Z'),
  });

  beforeEach(async () => {
    profileRepository = {
      create: vi.fn((data) => ({ ...data })),
      findOne: vi.fn(),
      save: vi.fn(),
    };
    userRepository = {
      findOne: vi.fn(),
    };

    moduleRef = await Test.createTestingModule({
      providers: [
        UserProfileService,
        {
          provide: getRepositoryToken(UserProfile),
          useValue: profileRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = moduleRef.get<UserProfileService>(UserProfileService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  describe('findForUser', () => {
    it('returns the profile response for the requested user', async () => {
      const expectedProfile = profile();
      profileRepository.findOne.mockResolvedValue(expectedProfile);

      await expect(service.findForUser(userId)).resolves.toEqual({
        goal: expectedProfile.goal,
        level: expectedProfile.level,
        daysPerWeek: expectedProfile.daysPerWeek,
        equipment: expectedProfile.equipment,
        weightKg: expectedProfile.weightKg,
        heightCm: expectedProfile.heightCm,
        birthDate: expectedProfile.birthDate,
      });
      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('returns a copy of the equipment array', async () => {
      const expectedProfile = profile();
      profileRepository.findOne.mockResolvedValue(expectedProfile);

      const result = await service.findForUser(userId);

      expect(result.equipment).not.toBe(expectedProfile.equipment);
    });

    it('throws NotFoundException when the user has no profile', async () => {
      profileRepository.findOne.mockResolvedValue(null);

      await expect(service.findForUser(userId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('replaceForUser', () => {
    it('creates and saves a profile when the user has no existing profile', async () => {
      const dto = profileDto();
      userRepository.findOne.mockResolvedValue(user);
      profileRepository.findOne.mockResolvedValue(null);
      profileRepository.save.mockImplementation(
        async (entity: UserProfile) => entity,
      );

      await expect(service.replaceForUser(userId, dto)).resolves.toEqual({
        goal: dto.goal,
        level: dto.level,
        daysPerWeek: dto.daysPerWeek,
        equipment: dto.equipment,
        weightKg: dto.weightKg,
        heightCm: dto.heightCm,
        birthDate: '1990-06-15',
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: { id: true },
      });
      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(profileRepository.create).toHaveBeenCalledWith({ userId, user });
      expect(profileRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          user,
          goal: dto.goal,
          level: dto.level,
          daysPerWeek: dto.daysPerWeek,
          equipment: dto.equipment,
          weightKg: dto.weightKg,
          heightCm: dto.heightCm,
          birthDate: '1990-06-15',
        }),
      );
    });

    it('replaces an existing profile without creating another entity', async () => {
      const dto = profileDto();
      const existingProfile = profile();
      userRepository.findOne.mockResolvedValue(user);
      profileRepository.findOne.mockResolvedValue(existingProfile);
      profileRepository.save.mockImplementation(
        async (entity: UserProfile) => entity,
      );

      const result = await service.replaceForUser(userId, dto);

      expect(profileRepository.create).not.toHaveBeenCalled();
      expect(profileRepository.save).toHaveBeenCalledWith(existingProfile);
      expect(existingProfile).toMatchObject({
        goal: dto.goal,
        level: dto.level,
        daysPerWeek: dto.daysPerWeek,
        equipment: dto.equipment,
        weightKg: dto.weightKg,
        heightCm: dto.heightCm,
        birthDate: '1990-06-15',
      });
      expect(result.birthDate).toBe('1990-06-15');
    });

    it('throws NotFoundException and does not query or save a profile when the user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.replaceForUser(userId, profileDto()),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: { id: true },
      });
      expect(profileRepository.findOne).not.toHaveBeenCalled();
      expect(profileRepository.create).not.toHaveBeenCalled();
      expect(profileRepository.save).not.toHaveBeenCalled();
    });

    it('copies the equipment array before storing and returning it', async () => {
      const dto = profileDto();
      userRepository.findOne.mockResolvedValue(user);
      profileRepository.findOne.mockResolvedValue(null);
      profileRepository.save.mockImplementation(
        async (entity: UserProfile) => entity,
      );

      const result = await service.replaceForUser(userId, dto);
      const savedProfile = profileRepository.save.mock
        .calls[0][0] as UserProfile;

      expect(savedProfile.equipment).not.toBe(dto.equipment);
      expect(result.equipment).not.toBe(savedProfile.equipment);
    });
  });
});
