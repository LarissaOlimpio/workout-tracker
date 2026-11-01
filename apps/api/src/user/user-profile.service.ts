import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity.js';
import { UserProfileDto } from './dto/user-profile.dto.js';
import { UserProfileResponseDto } from './dto/user-profile-response.dto.js';
import { UserProfile } from './user-profile.entity.js';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
      heightCm: dto.heightCm,
      birthDate: dto.birthDate.toISOString().slice(0, 10),
    });

    return this.toResponse(await this.profileRepo.save(profile));
  }

  private toResponse(profile: UserProfile): UserProfileResponseDto {
    return {
      goal: profile.goal,
      level: profile.level,
      daysPerWeek: profile.daysPerWeek,
      equipment: [...profile.equipment],
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      birthDate: profile.birthDate,
    };
  }
}
