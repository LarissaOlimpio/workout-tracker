import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CreateMeasurementDto } from './dto/create-measurement.dto.js';
import { MeasurementService } from './measurement.service.js';

@Controller('users')
export class MeasurementController {
  constructor(private readonly measurementService: MeasurementService) {}

  @UseGuards(JwtAuthGuard)
  @Post('me/measurements')
  createMeasurement(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateMeasurementDto,
  ) {
    return this.measurementService.upsertForUser(req.user.userId, dto);
  }
}
