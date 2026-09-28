import {
    OTP_LOCAL_NOTIFICATION_ENABLED_KEY,
    parseBooleanSetting,
    serializeBooleanSetting,
} from '../../domain/notification-channel';
import { UpdateOtpChannelSettingUseCasePort } from '../ports/in/update-otp-channel-setting.port';
import { AppSettingRepositoryPort } from '../ports/out/app-setting-repository.port';
import { OtpChannelSettingResult } from '../results/otp-channel-setting.result';

export class UpdateOtpChannelSettingUseCase
  implements UpdateOtpChannelSettingUseCasePort
{
  constructor(private readonly settings: AppSettingRepositoryPort) {}

  async execute(
    localNotificationEnabled: boolean,
  ): Promise<OtpChannelSettingResult> {
    const setting = await this.settings.upsert(
      OTP_LOCAL_NOTIFICATION_ENABLED_KEY,
      serializeBooleanSetting(localNotificationEnabled),
    );
    return {
      localNotificationEnabled: parseBooleanSetting(
        setting.value,
        localNotificationEnabled,
      ),
    };
  }
}
