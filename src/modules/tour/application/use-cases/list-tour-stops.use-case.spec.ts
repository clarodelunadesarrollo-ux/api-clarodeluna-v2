import {
    buildTourStop,
    createFakeTourStopRepository,
    FakeTourStopRepository,
} from './__testing__/tour-stop.fixtures';
import { ListTourStopsUseCase } from './list-tour-stops.use-case';

describe('ListTourStopsUseCase', () => {
  let stops: FakeTourStopRepository;
  let useCase: ListTourStopsUseCase;

  beforeEach(() => {
    stops = createFakeTourStopRepository();
    useCase = new ListTourStopsUseCase(stops);
  });

  it('returns the active stops ordered as provided by the repository', async () => {
    const first = buildTourStop({ order: 1 });
    const second = buildTourStop({
      id: '22222222-2222-2222-2222-222222222222',
      order: 2,
      title: 'Huerta',
    });
    stops.findAllActiveOrdered.mockResolvedValue([first, second]);

    const result = await useCase.execute();

    expect(stops.findAllActiveOrdered).toHaveBeenCalledTimes(1);
    expect(result).toEqual([first, second]);
  });
});
