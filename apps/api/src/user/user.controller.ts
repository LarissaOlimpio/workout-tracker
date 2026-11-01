import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UserProfileDto } from './dto/user-profile.dto.js';
import { UserProfileService } from './user-profile.service.js';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
  ) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: { user: { userId: string } }) {
    return this.userService.findById(req.user.userId);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(
    @Req() req: { user: { userId: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(req.user.userId, dto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMe(@Req() req: { user: { userId: string } }) {
    return this.userService.deleteById(req.user.userId);
  }
  @UseGuards(JwtAuthGuard)
  @Post('me/password')
  changePassword(
    @Req() req: { user: { userId: string } },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(req.user.userId, dto);
  }

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
