import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly name?: string | null;
}
