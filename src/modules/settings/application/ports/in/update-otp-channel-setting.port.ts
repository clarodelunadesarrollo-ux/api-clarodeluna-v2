import { OtpChannelSettingResult } from '../../results/otp-channel-setting.result';

export const UPDATE_OTP_CHANNEL_SETTING_USE_CASE = Symbol(
  'UPDATE_OTP_CHANNEL_SETTING_USE_CASE',
);

export interface UpdateOtpChannelSettingUseCasePort {
  execute(localNotificationEnabled: boolean): Promise<OtpChannelSettingResult>;
}
