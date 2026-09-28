import {
    createMockReservationBlackoutRepository,
    MockedReservationBlackoutRepository,
} from '../../__tests__/helpers';
import { BlackoutScope } from '../../domain/enums/blackout-scope.enum';
import { InvalidReservationDateException } from '../../domain/exceptions/invalid-reservation-date.exception';
import { CreateReservationBlackoutUseCase } from './create-reservation-blackout.use-case';

describe('CreateReservationBlackoutUseCase', () => {
  let blackouts: MockedReservationBlackoutRepository;
  let useCase: CreateReservationBlackoutUseCase;

  beforeEach(() => {
    blackouts = createMockReservationBlackoutRepository();
    useCase = new CreateReservationBlackoutUseCase(blackouts);
  });

  it('creates a blackout parsing the date as UTC midnight', async () => {
    blackouts.create.mockImplementation((input) =>
      Promise.resolve({
        id: 'b1',
        date: input.date,
        scope: input.scope,
        reason: input.reason,
        createdAt: new Date(),
      }),
    );

    await useCase.execute({
      date: '2026-10-15',
      scope: BlackoutScope.BOTH,
      reason: '  Feriado  ',
    });

    expect(blackouts.create).toHaveBeenCalledWith({
      date: new Date('2026-10-15T00:00:00.000Z'),
      scope: BlackoutScope.BOTH,
      reason: 'Feriado',
    });
  });

  it('normalizes a blank reason to null', async () => {
    blackouts.create.mockResolvedValue({
      id: 'b1',
      date: new Date('2026-10-15T00:00:00.000Z'),
      scope: BlackoutScope.TOUR,
      reason: null,
      createdAt: new Date(),
    });

    await useCase.execute({
      date: '2026-10-15',
      scope: BlackoutScope.TOUR,
      reason: '   ',
    });

    expect(blackouts.create).toHaveBeenCalledWith(
      expect.objectContaining({ reason: null }),
    );
  });

  it('rejects a malformed date', async () => {
    await expect(
      useCase.execute({ date: '15-10-2026', scope: BlackoutScope.BOTH }),
    ).rejects.toBeInstanceOf(InvalidReservationDateException);
    expect(blackouts.create).not.toHaveBeenCalled();
  });
});
