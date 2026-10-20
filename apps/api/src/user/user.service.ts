import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import * as argon2 from 'argon2';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}
  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
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
    return this.repo.save(user);
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.repo.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
  private toResponse(user: User): UserResponseDto {
    return { id: user.id, name: user.name, email: user.email };
  }

  async updateProfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.repo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

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

    const savedUser = await this.repo.save(user);

    return this.toResponse(savedUser);
  }
}
