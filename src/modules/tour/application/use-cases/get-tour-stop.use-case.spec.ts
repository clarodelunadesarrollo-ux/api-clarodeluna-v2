import { TourStopNotFoundException } from '../../domain/exceptions/tour-stop-not-found.exception';
import {
    buildTourStop,
    createFakeTourStopRepository,
    FakeTourStopRepository,
} from './__testing__/tour-stop.fixtures';
import { GetTourStopUseCase } from './get-tour-stop.use-case';

describe('GetTourStopUseCase', () => {
  let stops: FakeTourStopRepository;
  let useCase: GetTourStopUseCase;

  beforeEach(() => {
    stops = createFakeTourStopRepository();
    useCase = new GetTourStopUseCase(stops);
  });

  it('returns the stop when it exists', async () => {
    const stop = buildTourStop();
    stops.findById.mockResolvedValue(stop);

    const result = await useCase.execute(stop.id);

    expect(stops.findById).toHaveBeenCalledWith(stop.id);
    expect(result).toBe(stop);
  });

  it('throws TourStopNotFoundException when the stop is missing', async () => {
    stops.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(
      TourStopNotFoundException,
    );
  });
});
