import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { plainToInstance } from 'class-transformer';
import { QueryFailedError, Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { User } from './user.entity.js';
import { UserService } from './user.service.js';

describe('UserService', () => {
  let service: UserService;
  let moduleRef: TestingModule;
  let repository: {
    create: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };

  const userId = 'a4360fd3-3448-4f4c-a18e-1410c91940bd';
  const otherUserId = 'a7cd6904-60dc-4c41-aa9f-499ab67dfe8c';
  const user = (overrides: Partial<User> = {}): User =>
    ({
      id: userId,
      name: 'Alex Morgan',
      email: 'alex@example.com',
      passwordHash: 'stored-password-hash',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      ...overrides,
    }) as User;

  const postgresUniqueViolation = () =>
    new QueryFailedError(
      'INSERT INTO users',
      [],
      Object.assign(new Error('duplicate key'), { code: '23505' }),
    );

  beforeEach(async () => {
    repository = {
      create: vi.fn((data) => data),
      delete: vi.fn(),
      findOne: vi.fn(),
      save: vi.fn(),
    };

    moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
      ],
    }).compile();

    service = moduleRef.get<UserService>(UserService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  describe('findByEmail', () => {
    it('returns the matching user and queries by the supplied email', async () => {
      const expected = user();
      repository.findOne.mockResolvedValue(expected);

      await expect(service.findByEmail(expected.email)).resolves.toBe(expected);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: expected.email },
      });
    });

    it('returns null when no account has that email', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByEmail('missing@example.com')).resolves.toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'missing@example.com' },
      });
    });
  });

  describe('create', () => {
    it('hashes the password, uses normalized email, and returns no password data', async () => {
      const dto = plainToInstance(CreateUserDto, {
        name: 'Alex Morgan',
        email: '  Alex@Example.COM ',
        password: 'correct-horse-1',
      });
      repository.findOne.mockResolvedValue(null);
      repository.save.mockImplementation(async (entity: User) => ({
        ...entity,
        id: userId,
      }));

      const result = await service.create(dto);
      const savedUser = repository.save.mock.calls[0][0] as User;

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'alex@example.com' },
      });
      expect(savedUser.email).toBe('alex@example.com');
      expect(savedUser.passwordHash).not.toBe(dto.password);
      await expect(
        argon2.verify(savedUser.passwordHash, dto.password),
      ).resolves.toBe(true);
      expect(result).toEqual({
        id: userId,
        name: 'Alex Morgan',
        email: 'alex@example.com',
      });
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('rejects an email already found before inserting', async () => {
      repository.findOne.mockResolvedValue(user());

      await expect(
        service.create({
          name: 'Alex Morgan',
          email: 'alex@example.com',
          password: 'correct-horse-1',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('maps a PostgreSQL unique violation to ConflictException', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.save.mockRejectedValue(postgresUniqueViolation());

      await expect(
        service.create({
          name: 'Alex Morgan',
          email: 'alex@example.com',
          password: 'correct-horse-1',
        }),
      ).rejects.toMatchObject({
        constructor: ConflictException,
        status: 409,
      });
    });

    it('rethrows a non-unique database error unchanged', async () => {
      const databaseError = new Error('database unavailable');
      repository.findOne.mockResolvedValue(null);
      repository.save.mockRejectedValue(databaseError);

      await expect(
        service.create({
          name: 'Alex Morgan',
          email: 'alex@example.com',
          password: 'correct-horse-1',
        }),
      ).rejects.toBe(databaseError);
    });
  });

  describe('findById', () => {
    it('returns only the public profile fields for the requested id', async () => {
      repository.findOne.mockResolvedValue(user());

      await expect(service.findById(userId)).resolves.toEqual({
        id: userId,
        name: 'Alex Morgan',
        email: 'alex@example.com',
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('throws NotFoundException when the id does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById(userId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('updateProfile', () => {
    it('normalizes email, saves requested changes, and returns no password data', async () => {
      const currentUser = user();
      const dto = plainToInstance(UpdateProfileDto, {
        name: 'Alexandra Morgan',
        email: '  ALEXANDRA@EXAMPLE.COM ',
      });
      repository.findOne
        .mockResolvedValueOnce(currentUser)
        .mockResolvedValueOnce(null);
      repository.save.mockImplementation(async (entity: User) => entity);

      const result = await service.updateProfile(userId, dto);

      expect(repository.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: userId },
      });
      expect(repository.findOne).toHaveBeenNthCalledWith(2, {
        where: { email: 'alexandra@example.com' },
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: userId,
          name: 'Alexandra Morgan',
          email: 'alexandra@example.com',
          passwordHash: 'stored-password-hash',
        }),
      );
      expect(result).toEqual({
        id: userId,
        name: 'Alexandra Morgan',
        email: 'alexandra@example.com',
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('returns the existing public profile without saving when nothing changes', async () => {
      const currentUser = user();
      repository.findOne.mockResolvedValue(currentUser);

      await expect(
        service.updateProfile(userId, { name: currentUser.name }),
      ).resolves.toEqual({
        id: userId,
        name: currentUser.name,
        email: currentUser.email,
      });
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the profile id does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile(userId, { name: 'Alexandra Morgan' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rejects an email already owned by another user', async () => {
      repository.findOne
        .mockResolvedValueOnce(user())
        .mockResolvedValueOnce(user({ id: otherUserId }));

      await expect(
        service.updateProfile(userId, { email: 'taken@example.com' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('maps a PostgreSQL unique violation during save to ConflictException', async () => {
      repository.findOne
        .mockResolvedValueOnce(user())
        .mockResolvedValueOnce(null);
      repository.save.mockRejectedValue(postgresUniqueViolation());

      await expect(
        service.updateProfile(userId, { email: 'new@example.com' }),
      ).rejects.toMatchObject({
        constructor: ConflictException,
        status: 409,
      });
    });

    it('rethrows a non-unique database error during save unchanged', async () => {
      const databaseError = new Error('database unavailable');
      repository.findOne
        .mockResolvedValueOnce(user())
        .mockResolvedValueOnce(null);
      repository.save.mockRejectedValue(databaseError);

      await expect(
        service.updateProfile(userId, { email: 'new@example.com' }),
      ).rejects.toBe(databaseError);
    });
  });

  describe('deleteById', () => {
    it('hard-deletes the requested user id', async () => {
      repository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.deleteById(userId)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(userId);
    });

    it('throws NotFoundException when no row was deleted', async () => {
      repository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteById(userId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.delete).toHaveBeenCalledWith(userId);
    });
  });

  describe('changePassword', () => {
    it('verifies the current password, hashes the replacement, and returns only a message', async () => {
      const currentHash = await argon2.hash('current-password-1');
      const currentUser = user({ passwordHash: currentHash });
      repository.findOne.mockResolvedValue(currentUser);
      repository.save.mockImplementation(async (entity: User) => entity);

      const result = await service.changePassword(userId, {
        currentPassword: 'current-password-1',
        newPassword: 'replacement-password-2',
      } satisfies ChangePasswordDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(repository.save).toHaveBeenCalledWith(currentUser);
      expect(currentUser.passwordHash).not.toBe('replacement-password-2');
      await expect(
        argon2.verify(currentUser.passwordHash, 'replacement-password-2'),
      ).resolves.toBe(true);
      expect(result).toEqual({ message: 'Password changed successfully' });
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws NotFoundException when the user does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword(userId, {
          currentPassword: 'current-password-1',
          newPassword: 'replacement-password-2',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rejects an incorrect current password', async () => {
      repository.findOne.mockResolvedValue(
        user({ passwordHash: await argon2.hash('actual-password-1') }),
      );

      await expect(
        service.changePassword(userId, {
          currentPassword: 'wrong-password-1',
          newPassword: 'replacement-password-2',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rejects a replacement password that matches the current password', async () => {
      const currentHash = await argon2.hash('same-password-1');
      repository.findOne.mockResolvedValue(
        user({ passwordHash: currentHash }),
      );

      await expect(
        service.changePassword(userId, {
          currentPassword: 'same-password-1',
          newPassword: 'same-password-1',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});

