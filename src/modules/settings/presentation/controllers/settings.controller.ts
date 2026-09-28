import { Body, Controller, Get, Inject, Patch } from '@nestjs/common';

import { Public } from '../../../../common/decorators/public.decorator';
import {
    GET_OTP_CHANNEL_SETTING_USE_CASE,
    GetOtpChannelSettingUseCasePort,
} from '../../application/ports/in/get-otp-channel-setting.port';
import {
    UPDATE_OTP_CHANNEL_SETTING_USE_CASE,
    UpdateOtpChannelSettingUseCasePort,
} from '../../application/ports/in/update-otp-channel-setting.port';
import { OtpChannelResponseDto } from '../dtos/otp-channel-response.dto';
import { UpdateOtpChannelDto } from '../dtos/update-otp-channel.dto';

@Controller('settings/otp-channel')
export class SettingsController {
  constructor(
    @Inject(GET_OTP_CHANNEL_SETTING_USE_CASE)
    private readonly getOtpChannel: GetOtpChannelSettingUseCasePort,
    @Inject(UPDATE_OTP_CHANNEL_SETTING_USE_CASE)
    private readonly updateOtpChannel: UpdateOtpChannelSettingUseCasePort,
  ) {}

  // Public: the app reads this flag before the user is authenticated,
  // while requesting the OTP during the login flow.
  @Public()
  @Get()
  async get(): Promise<OtpChannelResponseDto> {
    const result = await this.getOtpChannel.execute();
    return new OtpChannelResponseDto(result);
  }

  // Protected by the global JWT guard. Admin-role authorization is future work;
  // the dedicated admin app will consume this endpoint with its own auth.
  @Patch()
  async update(
    @Body() dto: UpdateOtpChannelDto,
  ): Promise<OtpChannelResponseDto> {
    const result = await this.updateOtpChannel.execute(
      dto.localNotificationEnabled,
    );
    return new OtpChannelResponseDto(result);
  }
}
