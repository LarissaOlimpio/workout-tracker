import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  Max,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  ProfileEquipment,
  ProfileGoal,
  ProfileLevel,
} from '../types/user-profile.enums.js';

@ValidatorConstraint({ name: 'validEquipmentSelection', async: false })
class ValidEquipmentSelection implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return (
      Array.isArray(value) &&
      !(value.includes(ProfileEquipment.None) && value.length > 1)
    );
  }

  defaultMessage(): string {
    return 'none cannot be combined with other equipment';
  }
}

@ValidatorConstraint({ name: 'birthDateNotInFuture', async: false })
class BirthDateNotInFuture implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return false;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return value.getTime() <= today.getTime();
  }

  defaultMessage(): string {
    return 'birthDate cannot be in the future';
  }
}

@ValidatorConstraint({ name: 'minimumBirthDateAge', async: false })
class MinimumBirthDateAge implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return false;
    const minimumBirthDate = new Date();
    minimumBirthDate.setUTCHours(0, 0, 0, 0);
    minimumBirthDate.setUTCFullYear(minimumBirthDate.getUTCFullYear() - 13);
    return value.getTime() <= minimumBirthDate.getTime();
  }

  defaultMessage(): string {
    return 'user must be at least 13 years old';
  }
}

export class UserProfileDto {
  @IsEnum(ProfileGoal)
  goal: ProfileGoal;

  @IsEnum(ProfileLevel)
  level: ProfileLevel;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  daysPerWeek: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(ProfileEquipment, { each: true })
  @Validate(ValidEquipmentSelection)
  equipment: ProfileEquipment[];

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(30)
  @Max(300)
  weightKg: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(100)
  @Max(250)
  heightCm: number;

  @Type(() => Date)
  @IsDate()
  @Validate(BirthDateNotInFuture)
  @Validate(MinimumBirthDateAge)
  birthDate: Date;
}
