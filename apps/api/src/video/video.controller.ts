import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { VideoFeedbackDto } from './dto/video-feedback.dto.js';
import { VideoService } from './video.service.js';

@Controller()
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @UseGuards(JwtAuthGuard)
  @Get('users/me/recommendations')
  getRecommendations(@Req() req: { user: { userId: string } }) {
    return this.videoService.getRecommendations(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('videos/:id/feedback')
  setFeedback(
    @Req() req: { user: { userId: string } },
    @Param('id') videoId: string,
    @Body() dto: VideoFeedbackDto,
  ) {
    return this.videoService.setFeedback(req.user.userId, videoId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('videos/:id/feedback')
  @HttpCode(HttpStatus.NO_CONTENT)
  clearFeedback(
    @Req() req: { user: { userId: string } },
    @Param('id') videoId: string,
  ) {
    return this.videoService.clearFeedback(req.user.userId, videoId);
  }
}
