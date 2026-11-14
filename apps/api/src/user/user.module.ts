import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user.entity.js';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { UserProfile } from './profile/user-profile.entity.js';
import { UserProfileService } from './profile/user-profile.service.js';
import { UserProfileController } from './profile/user-profile.controller.js';
import { Measurement } from '../measurement/measurement.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, Measurement])],
  controllers: [UserController, UserProfileController],
  providers: [UserService, UserProfileService],
  exports: [UserService, UserProfileService],
})
export class UserModule {}
