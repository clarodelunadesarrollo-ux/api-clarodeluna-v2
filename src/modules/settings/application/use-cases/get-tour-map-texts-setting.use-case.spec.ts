import { AppSetting } from '../../domain/entities/app-setting.entity';
import { AppSettingRepositoryPort } from '../ports/out/app-setting-repository.port';
import { GetTourMapTextsSettingUseCase } from './get-tour-map-texts-setting.use-case';

describe('GetTourMapTextsSettingUseCase', () => {
  let settings: {
    findByKey: jest.Mock;
    upsert: jest.Mock;
  };
  let useCase: GetTourMapTextsSettingUseCase;

  beforeEach(() => {
    settings = {
      findByKey: jest.fn(),
      upsert: jest.fn(),
    };
    useCase = new GetTourMapTextsSettingUseCase(
      settings as unknown as AppSettingRepositoryPort,
    );
  });

  it('returns the Spanish defaults when the setting does not exist', async () => {
    settings.findByKey.mockResolvedValue(null);

    const result = await useCase.execute();

    expect(settings.findByKey).toHaveBeenCalledWith('tour.map_texts');
    expect(result.title).toBe('Tu recorrido');
    expect(result.stepLabel).toBe('Parada {order}');
    expect(result.failureServer).toBe('No pudimos cargar el recorrido. Reintentá.');
  });

  it('returns the stored values when present', async () => {
    const stored = {
      title: 'Nuestro tour',
      subtitle: 'Elegí un punto.',
      retry: 'Probar de nuevo',
      backTooltip: 'Inicio',
      refreshTooltip: 'Refrescar',
      close: 'Salir',
      emptyTitle: 'Sin paradas',
      emptyMessage: 'Volvé más tarde.',
      stepLabel: 'Punto {order}',
      failureNetwork: 'Sin red.',
      failureSession: 'Sesión vencida.',
      failureServer: 'Error del servidor.',
    };
    settings.findByKey.mockResolvedValue(
      AppSetting.rehydrate({
        key: 'tour.map_texts',
        value: JSON.stringify(stored),
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute();

    expect(result).toEqual(stored);
  });

  it('merges stored partial over defaults for missing fields', async () => {
    settings.findByKey.mockResolvedValue(
      AppSetting.rehydrate({
        key: 'tour.map_texts',
        value: JSON.stringify({ title: 'Solo título' }),
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute();

    expect(result.title).toBe('Solo título');
    // Missing fields fall back to defaults.
    expect(result.subtitle).toBe('Tocá un punto del mapa para ver el detalle.');
    expect(result.stepLabel).toBe('Parada {order}');
  });

  it('falls back to defaults when the stored value is invalid JSON', async () => {
    settings.findByKey.mockResolvedValue(
      AppSetting.rehydrate({
        key: 'tour.map_texts',
        value: 'not-json {',
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute();

    expect(result.title).toBe('Tu recorrido');
    expect(result.stepLabel).toBe('Parada {order}');
  });
});
