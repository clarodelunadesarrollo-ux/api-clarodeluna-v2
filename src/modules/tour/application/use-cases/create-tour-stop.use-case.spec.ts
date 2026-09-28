import { InvalidTourStopException } from '../../domain/exceptions/invalid-tour-stop.exception';
import {
    buildTourStop,
    createFakeTourStopRepository,
    FakeTourStopRepository,
} from './__testing__/tour-stop.fixtures';
import { CreateTourStopUseCase } from './create-tour-stop.use-case';

describe('CreateTourStopUseCase', () => {
  let stops: FakeTourStopRepository;
  let useCase: CreateTourStopUseCase;

  beforeEach(() => {
    stops = createFakeTourStopRepository();
    useCase = new CreateTourStopUseCase(stops);
  });

  it('validates, trims and persists the stop defaulting active to true', async () => {
    const created = buildTourStop();
    stops.create.mockResolvedValue(created);

    const result = await useCase.execute({
      order: 1,
      title: '  Llegada y recepción  ',
      description: '  Te recibimos en la entrada principal.  ',
      positionX: 0.42,
      positionY: 0.68,
    });

    expect(stops.create).toHaveBeenCalledWith({
      order: 1,
      title: 'Llegada y recepción',
      description: 'Te recibimos en la entrada principal.',
      positionX: 0.42,
      positionY: 0.68,
      active: true,
    });
    expect(result).toBe(created);
  });

  it('honours an explicit active flag', async () => {
    stops.create.mockResolvedValue(buildTourStop({ active: false }));

    await useCase.execute({
      order: 2,
      title: 'Huerta',
      description: 'Recorrido por la huerta.',
      positionX: 0.22,
      positionY: 0.55,
      active: false,
    });

    expect(stops.create).toHaveBeenCalledWith(
      expect.objectContaining({ active: false }),
    );
  });

  it('rejects an empty title without touching the repository', async () => {
    await expect(
      useCase.execute({
        order: 1,
        title: '   ',
        description: 'Descripción válida.',
        positionX: 0.5,
        positionY: 0.5,
      }),
    ).rejects.toBeInstanceOf(InvalidTourStopException);
    expect(stops.create).not.toHaveBeenCalled();
  });

  it('rejects a position outside the 0-1 range', async () => {
    await expect(
      useCase.execute({
        order: 1,
        title: 'Parada',
        description: 'Descripción válida.',
        positionX: 1.4,
        positionY: 0.5,
      }),
    ).rejects.toBeInstanceOf(InvalidTourStopException);
    expect(stops.create).not.toHaveBeenCalled();
  });

  it('rejects a non-positive order', async () => {
    await expect(
      useCase.execute({
        order: 0,
        title: 'Parada',
        description: 'Descripción válida.',
        positionX: 0.5,
        positionY: 0.5,
      }),
    ).rejects.toBeInstanceOf(InvalidTourStopException);
    expect(stops.create).not.toHaveBeenCalled();
  });
});
