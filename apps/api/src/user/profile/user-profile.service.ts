import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity.js';
import { UserProfileDto } from './dto/user-profile.dto.js';
import { UserProfileResponseDto } from './dto/user-profile-response.dto.js';
import { UserProfile } from './user-profile.entity.js';
import { Measurement } from '../../measurement/measurement.entity.js';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Measurement)
    private readonly measurementRepo: Repository<Measurement>,
  ) {}

  async findForUser(userId: string): Promise<UserProfileResponseDto> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('User profile not found');
    }
    return this.toResponse(profile);
  }

  async replaceForUser(
    userId: string,
    dto: UserProfileDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile =
      (await this.profileRepo.findOne({ where: { userId } })) ??
      this.profileRepo.create({ userId, user });

    Object.assign(profile, {
      goal: dto.goal,
      level: dto.level,
      daysPerWeek: dto.daysPerWeek,
      equipment: [...dto.equipment],
      weightKg: dto.weightKg,
      targetWeightKg: dto.targetWeightKg ?? null,
      heightCm: dto.heightCm,
      chestCm: dto.chestCm ?? null,
      waistCm: dto.waistCm ?? null,
      hipCm: dto.hipCm ?? null,
      birthDate: dto.birthDate.toISOString().slice(0, 10),
    });

    const savedProfile = await this.profileRepo.save(profile);
    await this.syncLatestMeasurement(savedProfile);
    return this.toResponse(savedProfile);
  }

  private toResponse(profile: UserProfile): UserProfileResponseDto {
    return {
      goal: profile.goal,
      level: profile.level,
      daysPerWeek: profile.daysPerWeek,
      equipment: [...profile.equipment],
      weightKg: profile.weightKg,
      targetWeightKg: profile.targetWeightKg,
      heightCm: profile.heightCm,
      chestCm: profile.chestCm,
      waistCm: profile.waistCm,
      hipCm: profile.hipCm,
      birthDate: profile.birthDate,
    };
  }

  private async syncLatestMeasurement(profile: UserProfile): Promise<void> {
    const latest = await this.measurementRepo.findOne({
      where: { userId: profile.userId },
      order: { measuredAt: 'DESC' },
    });
    if (
      latest &&
      latest.weightKg === profile.weightKg &&
      latest.chestCm === profile.chestCm &&
      latest.waistCm === profile.waistCm &&
      latest.hipCm === profile.hipCm
    ) {
      return;
    }

    const measuredAt = new Date().toISOString().slice(0, 10);
    const todayMeasurement =
      (await this.measurementRepo.findOne({
        where: { userId: profile.userId, measuredAt },
      })) ??
      this.measurementRepo.create({ userId: profile.userId, measuredAt });
    Object.assign(todayMeasurement, {
      weightKg: profile.weightKg,
      chestCm: profile.chestCm,
      waistCm: profile.waistCm,
      hipCm: profile.hipCm,
    });
    await this.measurementRepo.save(todayMeasurement);
  }
}
