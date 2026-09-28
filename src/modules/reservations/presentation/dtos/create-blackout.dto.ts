import {
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { BlackoutScope } from '../../domain/enums/blackout-scope.enum';

export class CreateBlackoutDto {
  @IsDateString()
  readonly date!: string;

  @IsEnum(BlackoutScope)
  readonly scope!: BlackoutScope;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  readonly reason?: string;
}
