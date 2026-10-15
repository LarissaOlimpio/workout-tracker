import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity.js';
import { CreateUserDto } from './create-user.dto.js';
import * as argon2 from 'argon2';

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
}
