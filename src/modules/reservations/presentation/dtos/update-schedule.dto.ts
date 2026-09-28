import { IsBoolean, IsInt, Matches, Min } from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdateScheduleDto {
  @Matches(TIME_PATTERN, { message: 'openTime must be in HH:mm format' })
  readonly openTime!: string;

  @Matches(TIME_PATTERN, { message: 'closeTime must be in HH:mm format' })
  readonly closeTime!: string;

  @IsInt()
  @Min(1)
  readonly intervalMinutes!: number;

  @IsBoolean()
  readonly active!: boolean;
}
