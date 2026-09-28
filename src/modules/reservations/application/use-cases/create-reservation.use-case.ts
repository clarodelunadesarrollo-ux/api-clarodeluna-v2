import { BogotaClockPort } from '../../../../common/time/bogota-clock';
import { Reservation } from '../../domain/entities/reservation.entity';
import { ReservationType } from '../../domain/enums/reservation-type.enum';
import { TourLimitReachedException } from '../../domain/exceptions/tour-limit-reached.exception';
import { PartySize } from '../../domain/value-objects/party-size.vo';
import { ReservationDate } from '../../domain/value-objects/reservation-date.vo';
import { ReservationPolicyConfig } from '../config/reservation-policy.config';
import {
    CreateReservationCommand,
    CreateReservationUseCasePort,
} from '../ports/in/create-reservation.port';
import { ReservationRepositoryPort } from '../ports/out/reservation-repository.port';
import { UserLookupPort } from '../ports/out/user-lookup.port';
import { TimeSlotService } from '../services/time-slot.service';

/**
 * Creates a reservation: validates the date window and party size, checks the
 * time against the type's configuration, enforces the active-tour limit
 * (authoritative), freezes the holder name (user.name ?? email) and persists
 * it as ACTIVE.
 */
export class CreateReservationUseCase implements CreateReservationUseCasePort {
  constructor(
    private readonly reservations: ReservationRepositoryPort,
    private readonly timeSlots: TimeSlotService,
    private readonly users: UserLookupPort,
    private readonly clock: BogotaClockPort,
    private readonly policy: ReservationPolicyConfig,
  ) {}

  async execute(command: CreateReservationCommand): Promise<Reservation> {
    const today = this.clock.today();
    const date = ReservationDate.create(
      command.date,
      today,
      this.policy.dateWindowDays,
    );
    const partySize = PartySize.create(command.partySize);

    await this.timeSlots.ensureAvailable(command.type, date.value, command.time);

    if (command.type === ReservationType.TOUR) {
      const activeTours = await this.reservations.countActiveToursFrom(
        command.userId,
        today,
      );
      if (activeTours >= this.policy.maxActiveTours) {
        throw new TourLimitReachedException();
      }
    }

    const user = await this.users.findById(command.userId);
    const holderName =
      user?.name && user.name.trim().length > 0 ? user.name : command.email;

    return this.reservations.create({
      userId: command.userId,
      type: command.type,
      date: date.value,
      time: command.time,
      partySize: partySize.value,
      holderName,
    });
  }
}
