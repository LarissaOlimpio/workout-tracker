import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserProfile } from '../user/profile/user-profile.entity.js';
import { CreateMeasurementDto } from './dto/create-measurement.dto.js';
import { Measurement } from './measurement.entity.js';

@Injectable()
export class MeasurementService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async upsertForUser(
    userId: string,
    dto: CreateMeasurementDto,
  ): Promise<Measurement> {
    return this.dataSource.transaction(async (manager) => {
      const measurementRepo = manager.getRepository(Measurement);
      const profileRepo = manager.getRepository(UserProfile);
      const profile = await profileRepo.findOne({ where: { userId } });
      if (!profile) throw new NotFoundException('User profile not found');

      const measuredAt = dto.measuredAt ?? new Date().toISOString().slice(0, 10);
      const latest = await measurementRepo.findOne({
        where: { userId },
        order: { measuredAt: 'DESC' },
      });
      const isLatest = !latest || measuredAt >= latest.measuredAt;
      const measurement =
        (await measurementRepo.findOne({ where: { userId, measuredAt } })) ??
        measurementRepo.create({
          userId,
          measuredAt,
          chestCm: dto.chestCm ?? null,
          waistCm: dto.waistCm ?? null,
          hipCm: dto.hipCm ?? null,
        });

      measurement.weightKg = dto.weightKg;
      if (dto.chestCm !== undefined) measurement.chestCm = dto.chestCm;
      if (dto.waistCm !== undefined) measurement.waistCm = dto.waistCm;
      if (dto.hipCm !== undefined) measurement.hipCm = dto.hipCm;
      const savedMeasurement = await measurementRepo.save(measurement);

      if (isLatest) {
        profile.weightKg = dto.weightKg;
        if (dto.chestCm !== undefined) profile.chestCm = dto.chestCm;
        if (dto.waistCm !== undefined) profile.waistCm = dto.waistCm;
        if (dto.hipCm !== undefined) profile.hipCm = dto.hipCm;
        await profileRepo.save(profile);
      }

      return savedMeasurement;
    });
  }
}
