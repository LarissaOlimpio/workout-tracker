import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  @IsNotEmpty()
  @Matches(/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u, {
    message: 'The name contains invalid characters',
  })
  name: string;
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email: string;
  @IsString()
  @MinLength(8)
  password: string;
}
