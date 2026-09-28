import { IsBoolean } from 'class-validator';

export class UpdateOtpChannelDto {
  @IsBoolean()
  readonly localNotificationEnabled!: boolean;
}
