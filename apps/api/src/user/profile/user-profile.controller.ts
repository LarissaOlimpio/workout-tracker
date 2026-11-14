import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { UserProfileDto } from './dto/user-profile.dto.js';
import { UserProfileService } from './user-profile.service.js';

@Controller('users')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  getMyProfile(@Req() req: { user: { userId: string } }) {
    return this.userProfileService.findForUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/profile')
  replaceMyProfile(
    @Req() req: { user: { userId: string } },
    @Body() dto: UserProfileDto,
  ) {
    return this.userProfileService.replaceForUser(req.user.userId, dto);
  }
}
