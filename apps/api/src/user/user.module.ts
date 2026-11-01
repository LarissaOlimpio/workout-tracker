import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user.entity.js';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { UserProfile } from './user-profile.entity.js';
import { UserProfileService } from './user-profile.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile])],
  controllers: [UserController],
  providers: [UserService, UserProfileService],
  exports: [UserService],
})
export class UserModule {}
