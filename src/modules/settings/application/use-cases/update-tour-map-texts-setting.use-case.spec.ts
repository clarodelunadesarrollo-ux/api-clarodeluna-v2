import { AppSetting } from '../../domain/entities/app-setting.entity';
import { TOUR_MAP_TEXTS_DEFAULT } from '../../domain/tour-map-texts';
import { AppSettingRepositoryPort } from '../ports/out/app-setting-repository.port';
import { UpdateTourMapTextsSettingUseCase } from './update-tour-map-texts-setting.use-case';

describe('UpdateTourMapTextsSettingUseCase', () => {
  let settings: {
    findByKey: jest.Mock;
    upsert: jest.Mock;
  };
  let useCase: UpdateTourMapTextsSettingUseCase;

  beforeEach(() => {
    settings = {
      findByKey: jest.fn(),
      upsert: jest.fn(),
    };
    useCase = new UpdateTourMapTextsSettingUseCase(
      settings as unknown as AppSettingRepositoryPort,
    );
  });

  it('merges a partial patch over the defaults and persists the serialized result', async () => {
    settings.findByKey.mockResolvedValue(null);
    settings.upsert.mockImplementation((_key: string, value: string) =>
      AppSetting.rehydrate({
        key: 'tour.map_texts',
        value,
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute({ title: 'Nuevo título' });

    expect(settings.upsert).toHaveBeenCalledTimes(1);
    const [key, serialized] = settings.upsert.mock.calls[0] as [string, string];
    expect(key).toBe('tour.map_texts');
    const persisted = JSON.parse(serialized) as Record<string, string>;
    expect(persisted.title).toBe('Nuevo título');
    // Untouched fields keep their defaults.
    expect(persisted.subtitle).toBe(TOUR_MAP_TEXTS_DEFAULT.subtitle);
    expect(result.title).toBe('Nuevo título');
    expect(result.stepLabel).toBe('Parada {order}');
  });

  it('merges the patch over previously stored values', async () => {
    settings.findByKey.mockResolvedValue(
      AppSetting.rehydrate({
        key: 'tour.map_texts',
        value: JSON.stringify({
          ...TOUR_MAP_TEXTS_DEFAULT,
          title: 'Viejo',
          subtitle: 'Vieja subtitle',
        }),
        updatedAt: new Date(),
      }),
    );
    settings.upsert.mockImplementation((_key: string, value: string) =>
      AppSetting.rehydrate({
        key: 'tour.map_texts',
        value,
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute({ title: 'Nuevo' });

    expect(result.title).toBe('Nuevo');
    // Not in the patch, kept from storage.
    expect(result.subtitle).toBe('Vieja subtitle');
  });

  it('rejects a stepLabel that is missing the {order} token', async () => {
    settings.findByKey.mockResolvedValue(null);

    await expect(
      useCase.execute({ stepLabel: 'Parada' }),
    ).rejects.toThrow('stepLabel debe incluir el literal "{order}".');
    expect(settings.upsert).not.toHaveBeenCalled();
  });
});
