import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import * as argon2 from 'argon2';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}
  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }
  private toResponse(user: User): UserResponseDto {
    return { id: user.id, name: user.name, email: user.email };
  }
  private async getUserOrFail(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  private throwIfUniqueViolation(error: unknown): never {
    if (
      error instanceof QueryFailedError &&
      'code' in error.driverError &&
      error.driverError.code === '23505'
    ) {
      throw new ConflictException('Email already registered');
    }
    throw error;
  }
  async create(dto: CreateUserDto) {
    const existUser = await this.findByEmail(dto.email);
    if (existUser) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await argon2.hash(dto.password);

    const user = this.repo.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });
    let savedUser: User;
    try {
      savedUser = await this.repo.save(user);
    } catch (error) {
      this.throwIfUniqueViolation(error);
    }

    return this.toResponse(savedUser);
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.getUserOrFail(id);
    return this.toResponse(user);
  }

  async updateProfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.getUserOrFail(id);

    const nameChanged = dto.name !== undefined && dto.name !== user.name;

    const emailChanged = dto.email !== undefined && dto.email !== user.email;

    if (!nameChanged && !emailChanged) {
      return this.toResponse(user);
    }

    if (emailChanged && dto.email !== undefined) {
      const existingUser = await this.findByEmail(dto.email);

      if (existingUser && existingUser.id !== user.id) {
        throw new ConflictException('Email already registered');
      }

      user.email = dto.email;
    }

    if (nameChanged && dto.name !== undefined) {
      user.name = dto.name;
    }

    let savedUser: User;
    try {
      savedUser = await this.repo.save(user);
    } catch (error) {
      this.throwIfUniqueViolation(error);
    }

    return this.toResponse(savedUser);
  }
  async deleteById(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) {
      throw new NotFoundException('User not found');
    }
  }
  async changePassword(
    id: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.getUserOrFail(id);
    const currentPasswordIsValid = await argon2.verify(
      user.passwordHash,
      dto.currentPassword,
    );
    if (!currentPasswordIsValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const newPasswordIsSame = await argon2.verify(
      user.passwordHash,
      dto.newPassword,
    );
    if (newPasswordIsSame) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }
    user.passwordHash = await argon2.hash(dto.newPassword);
    await this.repo.save(user);
    return {
      message: 'Password changed successfully',
    };
  }
}
