import { AppSetting } from '../../domain/entities/app-setting.entity';
import { AppSettingRepositoryPort } from '../ports/out/app-setting-repository.port';
import { UpdateOtpChannelSettingUseCase } from './update-otp-channel-setting.use-case';

describe('UpdateOtpChannelSettingUseCase', () => {
  let settings: {
    findByKey: jest.Mock;
    upsert: jest.Mock;
  };
  let useCase: UpdateOtpChannelSettingUseCase;

  beforeEach(() => {
    settings = {
      findByKey: jest.fn(),
      upsert: jest.fn(),
    };
    useCase = new UpdateOtpChannelSettingUseCase(
      settings as unknown as AppSettingRepositoryPort,
    );
  });

  it('persists "false" and returns the updated flag', async () => {
    settings.upsert.mockResolvedValue(
      AppSetting.rehydrate({
        key: 'otp.local_notification_enabled',
        value: 'false',
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute(false);

    expect(settings.upsert).toHaveBeenCalledWith(
      'otp.local_notification_enabled',
      'false',
    );
    expect(result.localNotificationEnabled).toBe(false);
  });

  it('persists "true" and returns the updated flag', async () => {
    settings.upsert.mockResolvedValue(
      AppSetting.rehydrate({
        key: 'otp.local_notification_enabled',
        value: 'true',
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute(true);

    expect(settings.upsert).toHaveBeenCalledWith(
      'otp.local_notification_enabled',
      'true',
    );
    expect(result.localNotificationEnabled).toBe(true);
  });
});
