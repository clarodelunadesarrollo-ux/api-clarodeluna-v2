import { InvalidTourStopException } from '../../domain/exceptions/invalid-tour-stop.exception';
import { TourStopNotFoundException } from '../../domain/exceptions/tour-stop-not-found.exception';
import {
    buildTourStop,
    createFakeTourStopRepository,
    FakeTourStopRepository,
} from './__testing__/tour-stop.fixtures';
import { UpdateTourStopUseCase } from './update-tour-stop.use-case';

describe('UpdateTourStopUseCase', () => {
  let stops: FakeTourStopRepository;
  let useCase: UpdateTourStopUseCase;

  beforeEach(() => {
    stops = createFakeTourStopRepository();
    useCase = new UpdateTourStopUseCase(stops);
  });

  it('throws when the stop does not exist', async () => {
    stops.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing-id', { title: 'Nuevo' }),
    ).rejects.toBeInstanceOf(TourStopNotFoundException);
    expect(stops.update).not.toHaveBeenCalled();
  });

  it('persists only the provided fields, trimmed', async () => {
    const current = buildTourStop();
    stops.findById.mockResolvedValue(current);
    stops.update.mockResolvedValue(
      buildTourStop({ title: 'Recepción principal' }),
    );

    await useCase.execute(current.id, { title: '  Recepción principal  ' });

    expect(stops.update).toHaveBeenCalledWith(current.id, {
      title: 'Recepción principal',
    });
  });

  it('validates the merged result and rejects invalid changes', async () => {
    const current = buildTourStop();
    stops.findById.mockResolvedValue(current);

    await expect(
      useCase.execute(current.id, { positionY: 2 }),
    ).rejects.toBeInstanceOf(InvalidTourStopException);
    expect(stops.update).not.toHaveBeenCalled();
  });

  it('allows toggling active to false', async () => {
    const current = buildTourStop();
    stops.findById.mockResolvedValue(current);
    stops.update.mockResolvedValue(buildTourStop({ active: false }));

    await useCase.execute(current.id, { active: false });

    expect(stops.update).toHaveBeenCalledWith(current.id, { active: false });
  });
});
