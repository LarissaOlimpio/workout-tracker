import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash } from 'node:crypto';
import { DataSource, IsNull } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../user/user.entity.js';
import { UserService } from '../user/user.service.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { AuthService } from './auth.service.js';
import { MailService } from './mail.service.js';
import { PasswordResetToken } from './password-reset-token.entity.js';

vi.mock('argon2', () => ({
  verify: vi.fn(),
  hash: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let moduleRef: TestingModule;
  let userService: {
    findByEmail: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
  };
  let jwtService: { signAsync: ReturnType<typeof vi.fn> };
  let dataSource: { transaction: ReturnType<typeof vi.fn> };
  let mailService: { sendPasswordReset: ReturnType<typeof vi.fn> };
  let tokenRepository: {
    create: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };

  const userId = 'a4360fd3-3448-4f4c-a18e-1410c91940bd';
  const user = {
    id: userId,
    email: 'athlete@example.com',
    passwordHash: 'stored-password-hash',
  } as User;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-09T12:00:00.000Z'));
    userService = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };
    jwtService = { signAsync: vi.fn() };
    dataSource = { transaction: vi.fn() };
    mailService = { sendPasswordReset: vi.fn() };
    tokenRepository = {
      create: vi.fn((token) => ({ ...token })),
      delete: vi.fn(),
      save: vi.fn(async (token) => token),
    };

    moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
        { provide: DataSource, useValue: dataSource },
        { provide: MailService, useValue: mailService },
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: tokenRepository,
        },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    await moduleRef.close();
  });

  describe('login', () => {
    const dto: LoginDto = { email: user.email, password: 'password123' };

    it('signs a JWT and returns the user when credentials are valid', async () => {
      vi.mocked(argon2.verify).mockResolvedValue(true);
      userService.findByEmail.mockResolvedValue(user);
      userService.findById.mockResolvedValue(user);
      jwtService.signAsync.mockResolvedValue('access-token');

      await expect(service.login(dto)).resolves.toEqual({
        accessToken: 'access-token',
        user,
      });
      expect(userService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(argon2.verify).toHaveBeenCalledWith(user.passwordHash, dto.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
      expect(userService.findById).toHaveBeenCalledWith(user.id);
    });

    it('rejects an unknown email', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(argon2.verify).not.toHaveBeenCalled();
    });

    it('rejects an incorrect password', async () => {
      userService.findByEmail.mockResolvedValue(user);
      vi.mocked(argon2.verify).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(userService.findById).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    const dto: ForgotPasswordDto = { email: user.email };

    it('stores an expiring token hash and emails the matching raw token link', async () => {
      vi.stubEnv('WEB_ORIGIN', 'https://workout.example/');
      userService.findByEmail.mockResolvedValue(user);
      mailService.sendPasswordReset.mockResolvedValue(undefined);

      await expect(service.forgotPassword(dto)).resolves.toEqual({
        message: 'If the email is registered, we sent a password reset link',
      });

      expect(tokenRepository.delete).toHaveBeenCalledWith({
        userId: user.id,
        usedAt: IsNull(),
      });
      const savedToken = tokenRepository.save.mock.calls[0][0] as PasswordResetToken;
      const link = mailService.sendPasswordReset.mock.calls[0][1] as string;
      const rawToken = new URL(link).searchParams.get('token');
      expect(link).toMatch(/^https:\/\/workout\.example\/reset-password\?/);
      expect(rawToken).toBeTruthy();
      expect(savedToken.tokenHash).toBe(
        createHashForTest(rawToken as string),
      );
      expect(savedToken).toMatchObject({
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        usedAt: null,
      });
      expect(mailService.sendPasswordReset).toHaveBeenCalledWith(
        user.email,
        link,
      );
    });

    it('returns the same response without creating a token for an unknown email', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.forgotPassword(dto)).resolves.toEqual({
        message: 'If the email is registered, we sent a password reset link',
      });
      expect(tokenRepository.delete).not.toHaveBeenCalled();
      expect(tokenRepository.save).not.toHaveBeenCalled();
      expect(mailService.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('still returns the generic response when email delivery fails', async () => {
      userService.findByEmail.mockResolvedValue(user);
      mailService.sendPasswordReset.mockRejectedValue(new Error('SMTP failed'));

      await expect(service.forgotPassword(dto)).resolves.toMatchObject({
        message: 'If the email is registered, we sent a password reset link',
      });
      expect(tokenRepository.save).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const dto: ResetPasswordDto = {
      token: 'raw-reset-token',
      newPassword: 'new-password-123',
    };

    const setupTransaction = (
      resetToken: PasswordResetToken | null,
      updatedUsers: Array<{ id: string }> = [{ id: user.id }],
    ) => {
      const managerRepository = {
        findOne: vi.fn().mockResolvedValue(resetToken),
        save: vi.fn(async (token) => token),
      };
      const manager = {
        getRepository: vi.fn().mockReturnValue(managerRepository),
        query: vi.fn().mockResolvedValue(updatedUsers),
      };
      dataSource.transaction.mockImplementation(async (callback) =>
        callback(manager),
      );
      return { manager, managerRepository };
    };

    it('updates the password and marks the reset token as used', async () => {
      const resetToken = {
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: null,
      } as PasswordResetToken;
      const { manager, managerRepository } = setupTransaction(resetToken);
      vi.mocked(argon2.hash).mockResolvedValue('new-password-hash');

      await expect(service.resetPassword(dto)).resolves.toBeUndefined();

      expect(dataSource.transaction).toHaveBeenCalledOnce();
      expect(manager.getRepository).toHaveBeenCalledWith(PasswordResetToken);
      expect(managerRepository.findOne).toHaveBeenCalledWith({
        where: expect.objectContaining({ usedAt: IsNull() }),
        lock: { mode: 'pessimistic_write' },
      });
      expect(argon2.hash).toHaveBeenCalledWith(dto.newPassword);
      expect(manager.query).toHaveBeenCalledWith(
        'UPDATE "users" SET "passwordHash" = $1 WHERE "id" = $2 RETURNING "id"',
        ['new-password-hash', resetToken.userId],
      );
      expect(resetToken.usedAt).toEqual(new Date());
      expect(managerRepository.save).toHaveBeenCalledWith(resetToken);
    });

    it('rejects an unknown or already-used token', async () => {
      const { manager } = setupTransaction(null);

      await expect(service.resetPassword(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(manager.query).not.toHaveBeenCalled();
      expect(argon2.hash).not.toHaveBeenCalled();
    });

    it('rejects an expired token', async () => {
      const resetToken = {
        userId: user.id,
        expiresAt: new Date(Date.now() - 1),
        usedAt: null,
      } as PasswordResetToken;
      const { manager } = setupTransaction(resetToken);

      await expect(service.resetPassword(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(manager.query).not.toHaveBeenCalled();
      expect(argon2.hash).not.toHaveBeenCalled();
    });

    it('rejects when the user row no longer exists', async () => {
      const resetToken = {
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: null,
      } as PasswordResetToken;
      const { manager, managerRepository } = setupTransaction(resetToken, []);
      vi.mocked(argon2.hash).mockResolvedValue('new-password-hash');

      await expect(service.resetPassword(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(manager.query).toHaveBeenCalled();
      expect(managerRepository.save).not.toHaveBeenCalled();
    });
  });
});

function createHashForTest(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
