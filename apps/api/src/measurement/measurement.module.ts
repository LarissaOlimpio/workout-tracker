import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from '../user/profile/user-profile.entity.js';
import { MeasurementController } from './measurement.controller.js';
import { Measurement } from './measurement.entity.js';
import { MeasurementService } from './measurement.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Measurement, UserProfile])],
  controllers: [MeasurementController],
  providers: [MeasurementService],
})
export class MeasurementModule {}
