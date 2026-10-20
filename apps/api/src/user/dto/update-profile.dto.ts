import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  @IsString()
  @MinLength(2)
  @Matches(/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u, {
    message: 'The name contains invalid characters',
  })
  name?: string;
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsEmail()
  email?: string;
}
