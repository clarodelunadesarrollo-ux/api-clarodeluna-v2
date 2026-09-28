import { OtpChannelSettingResult } from '../../results/otp-channel-setting.result';

export const GET_OTP_CHANNEL_SETTING_USE_CASE = Symbol(
  'GET_OTP_CHANNEL_SETTING_USE_CASE',
);

export interface GetOtpChannelSettingUseCasePort {
  execute(): Promise<OtpChannelSettingResult>;
}
