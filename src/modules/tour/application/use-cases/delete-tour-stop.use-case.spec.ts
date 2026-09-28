import { TourStopNotFoundException } from '../../domain/exceptions/tour-stop-not-found.exception';
import {
    buildTourStop,
    createFakeTourStopRepository,
    FakeTourStopRepository,
} from './__testing__/tour-stop.fixtures';
import { DeleteTourStopUseCase } from './delete-tour-stop.use-case';

describe('DeleteTourStopUseCase', () => {
  let stops: FakeTourStopRepository;
  let useCase: DeleteTourStopUseCase;

  beforeEach(() => {
    stops = createFakeTourStopRepository();
    useCase = new DeleteTourStopUseCase(stops);
  });

  it('deletes the stop when it exists', async () => {
    const stop = buildTourStop();
    stops.findById.mockResolvedValue(stop);
    stops.delete.mockResolvedValue(undefined);

    await useCase.execute(stop.id);

    expect(stops.delete).toHaveBeenCalledWith(stop.id);
  });

  it('throws when the stop does not exist', async () => {
    stops.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(
      TourStopNotFoundException,
    );
    expect(stops.delete).not.toHaveBeenCalled();
  });
});
