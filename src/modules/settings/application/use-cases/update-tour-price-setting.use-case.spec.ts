import { AppSetting } from '../../domain/entities/app-setting.entity';
import { AppSettingRepositoryPort } from '../ports/out/app-setting-repository.port';
import { UpdateTourPriceSettingUseCase } from './update-tour-price-setting.use-case';

describe('UpdateTourPriceSettingUseCase', () => {
  let settings: {
    findByKey: jest.Mock;
    upsert: jest.Mock;
  };
  let useCase: UpdateTourPriceSettingUseCase;

  beforeEach(() => {
    settings = {
      findByKey: jest.fn(),
      upsert: jest.fn(),
    };
    useCase = new UpdateTourPriceSettingUseCase(
      settings as unknown as AppSettingRepositoryPort,
    );
  });

  it('persists the serialized price and returns the updated value', async () => {
    settings.upsert.mockResolvedValue(
      AppSetting.rehydrate({
        key: 'tour.price_cents',
        value: '7500000',
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute(7500000);

    expect(settings.upsert).toHaveBeenCalledWith('tour.price_cents', '7500000');
    expect(result.priceCents).toBe(7500000);
  });

  it('persists zero and returns it', async () => {
    settings.upsert.mockResolvedValue(
      AppSetting.rehydrate({
        key: 'tour.price_cents',
        value: '0',
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute(0);

    expect(settings.upsert).toHaveBeenCalledWith('tour.price_cents', '0');
    expect(result.priceCents).toBe(0);
  });
});
