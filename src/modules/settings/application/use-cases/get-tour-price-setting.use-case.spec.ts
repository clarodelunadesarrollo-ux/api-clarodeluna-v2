import { AppSetting } from '../../domain/entities/app-setting.entity';
import { AppSettingRepositoryPort } from '../ports/out/app-setting-repository.port';
import { GetTourPriceSettingUseCase } from './get-tour-price-setting.use-case';

describe('GetTourPriceSettingUseCase', () => {
  let settings: {
    findByKey: jest.Mock;
    upsert: jest.Mock;
  };
  let useCase: GetTourPriceSettingUseCase;

  beforeEach(() => {
    settings = {
      findByKey: jest.fn(),
      upsert: jest.fn(),
    };
    useCase = new GetTourPriceSettingUseCase(
      settings as unknown as AppSettingRepositoryPort,
    );
  });

  it('returns the default (5000000) when the setting does not exist', async () => {
    settings.findByKey.mockResolvedValue(null);

    const result = await useCase.execute();

    expect(result.priceCents).toBe(5000000);
    expect(settings.findByKey).toHaveBeenCalledWith('tour.price_cents');
  });

  it('returns the stored integer value', async () => {
    settings.findByKey.mockResolvedValue(
      AppSetting.rehydrate({
        key: 'tour.price_cents',
        value: '7500000',
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute();

    expect(result.priceCents).toBe(7500000);
  });

  it('falls back to the default when the stored value is not a number', async () => {
    settings.findByKey.mockResolvedValue(
      AppSetting.rehydrate({
        key: 'tour.price_cents',
        value: 'not-a-number',
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute();

    expect(result.priceCents).toBe(5000000);
  });
});
