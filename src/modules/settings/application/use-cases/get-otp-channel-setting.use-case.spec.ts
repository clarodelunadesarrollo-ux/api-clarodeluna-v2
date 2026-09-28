import { AppSetting } from '../../domain/entities/app-setting.entity';
import { AppSettingRepositoryPort } from '../ports/out/app-setting-repository.port';
import { GetOtpChannelSettingUseCase } from './get-otp-channel-setting.use-case';

describe('GetOtpChannelSettingUseCase', () => {
  let settings: {
    findByKey: jest.Mock;
    upsert: jest.Mock;
  };
  let useCase: GetOtpChannelSettingUseCase;

  beforeEach(() => {
    settings = {
      findByKey: jest.fn(),
      upsert: jest.fn(),
    };
    useCase = new GetOtpChannelSettingUseCase(
      settings as unknown as AppSettingRepositoryPort,
    );
  });

  it('returns the default (true) when the setting does not exist', async () => {
    settings.findByKey.mockResolvedValue(null);

    const result = await useCase.execute();

    expect(result.localNotificationEnabled).toBe(true);
    expect(settings.findByKey).toHaveBeenCalledWith(
      'otp.local_notification_enabled',
    );
  });

  it('returns false when the stored value is "false"', async () => {
    settings.findByKey.mockResolvedValue(
      AppSetting.rehydrate({
        key: 'otp.local_notification_enabled',
        value: 'false',
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute();

    expect(result.localNotificationEnabled).toBe(false);
  });

  it('returns true when the stored value is "true"', async () => {
    settings.findByKey.mockResolvedValue(
      AppSetting.rehydrate({
        key: 'otp.local_notification_enabled',
        value: 'true',
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute();

    expect(result.localNotificationEnabled).toBe(true);
  });
});
