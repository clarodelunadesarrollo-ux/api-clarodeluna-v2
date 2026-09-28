import { InvalidReservationDateException } from '../../domain/exceptions/invalid-reservation-date.exception';
import {
    CreateReservationBlackoutCommand,
    CreateReservationBlackoutUseCasePort,
} from '../ports/in/create-reservation-blackout.port';
import {
    ReservationBlackoutRepositoryPort,
    ReservationBlackoutView,
} from '../ports/out/reservation-blackout-repository.port';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Creates a blocked date. The date is parsed as UTC midnight to match the
 * @db.Date column and the reservation date value objects. Duplicate dates are
 * rejected by the repository (unique constraint).
 */
export class CreateReservationBlackoutUseCase
  implements CreateReservationBlackoutUseCasePort
{
  constructor(
    private readonly blackouts: ReservationBlackoutRepositoryPort,
  ) {}

  async execute(
    command: CreateReservationBlackoutCommand,
  ): Promise<ReservationBlackoutView> {
    if (!DATE_PATTERN.test(command.date)) {
      throw new InvalidReservationDateException();
    }

    const date = new Date(`${command.date}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      throw new InvalidReservationDateException();
    }

    const reason =
      command.reason && command.reason.trim().length > 0
        ? command.reason.trim()
        : null;

    return this.blackouts.create({
      date,
      scope: command.scope,
      reason,
    });
  }
}
