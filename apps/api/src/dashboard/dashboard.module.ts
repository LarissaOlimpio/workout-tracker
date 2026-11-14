import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Measurement } from '../measurement/measurement.entity.js';
import { UserProfile } from '../user/profile/user-profile.entity.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile, Measurement])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
