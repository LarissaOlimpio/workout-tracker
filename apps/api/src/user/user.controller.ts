import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
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
}
