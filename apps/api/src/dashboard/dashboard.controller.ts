import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { DashboardService } from './dashboard.service.js';

@Controller('users')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/dashboard')
  getDashboard(@Req() req: { user: { userId: string } }) {
    return this.dashboardService.getForUser(req.user.userId);
  }
}
