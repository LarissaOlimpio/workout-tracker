import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module.js';
import { VideoController } from './video.controller.js';
import { VideoFeedback } from './video-feedback.entity.js';
import { Video } from './video.entity.js';
import { VideoService } from './video.service.js';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Video, VideoFeedback])],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
