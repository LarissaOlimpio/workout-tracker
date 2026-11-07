import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { DataSource, IsNull } from 'typeorm';
import { PasswordResetToken } from './password-reset-token.entity.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { MailService } from './mail.service.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jtwService: JwtService,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}
  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password ');
    }
    const passwordIsValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid password ');
    }

    const accessToken = await this.jtwService.signAsync({
      sub: user.id,
      email: user.email,
    });
    return { accessToken, user: await this.userService.findById(user.id) };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (user) {
      const token = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const tokenRepository = this.dataSource.getRepository(PasswordResetToken);
      await tokenRepository.delete({ userId: user.id, usedAt: IsNull() });
      await tokenRepository.save(
        tokenRepository.create({
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          usedAt: null,
        }),
      );
      const webOrigin = process.env.WEB_ORIGIN ?? '';
      const link = `${webOrigin.replace(/\/$/, '')}/reset-password?token=${token}`;
      try {
        await this.mailService.sendPasswordReset(user.email, link);
      } catch (error) {
        this.logger.error('Failed to send password reset email', error);
      }
    }
    return {
      message: 'If the email is registered, we sent a password reset link',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    await this.dataSource.transaction(async (manager) => {
      const tokenRepository = manager.getRepository(PasswordResetToken);
      const resetToken = await tokenRepository.findOne({
        where: { tokenHash, usedAt: IsNull() },
        lock: { mode: 'pessimistic_write' },
      });
      if (!resetToken || resetToken.expiresAt <= new Date()) {
        throw new BadRequestException('Invalid or expired token');
      }

      const passwordHash = await argon2.hash(dto.newPassword);
      const updatedUsers = (await manager.query(
        'UPDATE "users" SET "passwordHash" = $1 WHERE "id" = $2 RETURNING "id"',
        [passwordHash, resetToken.userId],
      )) as Array<{ id: string }>;
      if (updatedUsers.length === 0) {
        throw new BadRequestException('Invalid or expired token');
      }

      resetToken.usedAt = new Date();
      await tokenRepository.save(resetToken);
    });
  }
}
