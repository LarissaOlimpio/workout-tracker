import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jtwService: JwtService,
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
    return {
      access_token: accessToken,
    };
  }
}
