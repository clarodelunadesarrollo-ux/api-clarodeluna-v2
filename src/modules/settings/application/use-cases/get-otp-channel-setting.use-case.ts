import {
    OTP_LOCAL_NOTIFICATION_ENABLED_DEFAULT,
    OTP_LOCAL_NOTIFICATION_ENABLED_KEY,
    parseBooleanSetting,
} from '../../domain/notification-channel';
import { GetOtpChannelSettingUseCasePort } from '../ports/in/get-otp-channel-setting.port';
import { AppSettingRepositoryPort } from '../ports/out/app-setting-repository.port';
import { OtpChannelSettingResult } from '../results/otp-channel-setting.result';

export class GetOtpChannelSettingUseCase
  implements GetOtpChannelSettingUseCasePort
{
  constructor(private readonly settings: AppSettingRepositoryPort) {}

  async execute(): Promise<OtpChannelSettingResult> {
    const setting = await this.settings.findByKey(
      OTP_LOCAL_NOTIFICATION_ENABLED_KEY,
    );
    const localNotificationEnabled = parseBooleanSetting(
      setting?.value ?? null,
      OTP_LOCAL_NOTIFICATION_ENABLED_DEFAULT,
    );
    return { localNotificationEnabled };
  }
}
