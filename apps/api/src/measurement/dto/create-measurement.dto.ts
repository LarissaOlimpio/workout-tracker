import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  Matches,
  Max,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'measurementDateNotTooFarInFuture', async: false })
class MeasurementDateNotTooFarInFuture
  implements ValidatorConstraintInterface
{
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== value
    ) {
      return false;
    }
    const latestAllowed = new Date();
    latestAllowed.setUTCHours(0, 0, 0, 0);
    latestAllowed.setUTCDate(latestAllowed.getUTCDate() + 1);
    return value <= latestAllowed.toISOString().slice(0, 10);
  }

  defaultMessage(): string {
    return 'measuredAt cannot be more than one day in the future';
  }
}

export class CreateMeasurementDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  @Validate(MeasurementDateNotTooFarInFuture)
  measuredAt?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(30)
  @Max(300)
  weightKg: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(30)
  @Max(250)
  chestCm?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(30)
  @Max(250)
  waistCm?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(30)
  @Max(250)
  hipCm?: number | null;
}
