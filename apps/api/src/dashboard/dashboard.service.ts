import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../user/profile/user-profile.entity.js';
import { Measurement } from '../measurement/measurement.entity.js';
import { DashboardResponseDto } from './dto/dashboard-response.dto.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(Measurement)
    private readonly measurementRepo: Repository<Measurement>,
  ) {}

  async getForUser(userId: string): Promise<DashboardResponseDto> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('User profile not found');

    let measurements = await this.measurementRepo.find({
      where: { userId },
      order: { measuredAt: 'ASC' },
    });
    if (measurements.length === 0) {
      const initial = this.measurementRepo.create({
        userId,
        measuredAt: new Date().toISOString().slice(0, 10),
        weightKg: profile.weightKg,
        chestCm: profile.chestCm,
        waistCm: profile.waistCm,
        hipCm: profile.hipCm,
      });
      measurements = [await this.measurementRepo.save(initial)];
    }

    const start = measurements[0];
    const current = measurements[measurements.length - 1];
    const targetKg = profile.targetWeightKg ?? null;
    const progressPct =
      targetKg === null || targetKg === start.weightKg
        ? null
        : Math.max(
            0,
            Math.min(
              100,
              ((current.weightKg - start.weightKg) /
                (targetKg - start.weightKg)) *
                100,
            ),
          );

    const bmiRaw = current.weightKg / (profile.heightCm / 100) ** 2;
    const bmiValue = Number(bmiRaw.toFixed(1));
    const bmiCategory: DashboardResponseDto['bmi']['category'] =
      bmiValue < 18.5
        ? 'underweight'
        : bmiValue < 25
          ? 'normal'
          : bmiValue < 30
            ? 'overweight'
            : 'obese';
    const cutoffDate = this.sixMonthsAgo();
    const recentMeasurements = measurements.filter(
      (measurement) => measurement.measuredAt >= cutoffDate,
    );

    return {
      goal: profile.goal,
      weight: {
        currentKg: current.weightKg,
        startKg: start.weightKg,
        deltaKg: current.weightKg - start.weightKg,
        targetKg,
        progressPct,
      },
      bmi: {
        value: bmiValue,
        category: bmiCategory,
      },
      training: {
        goalPerWeek: profile.daysPerWeek,
        currentPerWeek: null,
      },
      weightSeries: recentMeasurements.map((measurement) => ({
        date: measurement.measuredAt,
        weightKg: measurement.weightKg,
      })),
      measurementSeries: recentMeasurements.map((measurement) => ({
        date: measurement.measuredAt,
        chestCm: measurement.chestCm,
        waistCm: measurement.waistCm,
        hipCm: measurement.hipCm,
      })),
      history: measurements
        .slice(-10)
        .reverse()
        .map((measurement) => ({
          date: measurement.measuredAt,
          weightKg: measurement.weightKg,
          chestCm: measurement.chestCm,
          waistCm: measurement.waistCm,
          hipCm: measurement.hipCm,
        })),
    };
  }

  private sixMonthsAgo(): string {
    const date = new Date();
    const targetMonthIndex = date.getUTCMonth() - 6;
    const targetYear = date.getUTCFullYear() + Math.floor(targetMonthIndex / 12);
    const targetMonth = (targetMonthIndex + 12) % 12;
    const targetDay = Math.min(
      date.getUTCDate(),
      new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate(),
    );
    return new Date(Date.UTC(targetYear, targetMonth, targetDay))
      .toISOString()
      .slice(0, 10);
  }
}
