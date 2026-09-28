import {
    buildReservation,
    createMockReservationRepository,
    MockedReservationRepository,
} from '../../__tests__/helpers';
import { ReservationStatus } from '../../domain/enums/reservation-status.enum';
import { ReservationForbiddenException } from '../../domain/exceptions/reservation-forbidden.exception';
import { ReservationLockedException } from '../../domain/exceptions/reservation-locked.exception';
import { ReservationNotFoundException } from '../../domain/exceptions/reservation-not-found.exception';
import { CancelReservationUseCase } from './cancel-reservation.use-case';

describe('CancelReservationUseCase', () => {
  let reservations: MockedReservationRepository;
  let useCase: CancelReservationUseCase;

  beforeEach(() => {
    reservations = createMockReservationRepository();
    useCase = new CancelReservationUseCase(reservations);
  });

  const command = { userId: 'user-1', reservationId: 'res-1' };

  it('rejects an unknown reservation (404)', async () => {
    reservations.findById.mockResolvedValue(null);

    await expect(useCase.execute(command)).rejects.toBeInstanceOf(
      ReservationNotFoundException,
    );
  });

  it('rejects a reservation owned by another user (403)', async () => {
    reservations.findById.mockResolvedValue(
      buildReservation({ userId: 'someone-else' }),
    );

    await expect(useCase.execute(command)).rejects.toBeInstanceOf(
      ReservationForbiddenException,
    );
    expect(reservations.updateStatus).not.toHaveBeenCalled();
  });

  it('rejects a frozen reservation (409)', async () => {
    reservations.findById.mockResolvedValue(
      buildReservation({ status: ReservationStatus.CANCELLED }),
    );

    await expect(useCase.execute(command)).rejects.toBeInstanceOf(
      ReservationLockedException,
    );
    expect(reservations.updateStatus).not.toHaveBeenCalled();
  });

  it('marks an owned ACTIVE reservation as CANCELLED', async () => {
    reservations.findById.mockResolvedValue(buildReservation());
    reservations.updateStatus.mockResolvedValue(
      buildReservation({ status: ReservationStatus.CANCELLED }),
    );

    await useCase.execute(command);

    expect(reservations.updateStatus).toHaveBeenCalledWith(
      'res-1',
      ReservationStatus.CANCELLED,
    );
  });
});
