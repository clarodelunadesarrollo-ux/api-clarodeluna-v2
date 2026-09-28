import { Inject, Injectable } from '@nestjs/common';
import { ReservationStatus as PrismaReservationStatus } from '@prisma/client';

import {
    BOGOTA_CLOCK,
    BogotaClockPort,
} from '../../../../../common/time/bogota-clock';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { HuertaAccessPort } from '../../../application/ports/out/huerta-access.port';

/**
 * Resolves whether the guest can see the huerta by reading the Reservation
 * table directly (no dependency on the reservations module). Unlike the menu,
 * the huerta content does not depend on the reservation type: it only matters
 * whether the user has any CHECKED_IN reservation for today (AD-1).
 */
@Injectable()
export class HuertaAccessPrismaAdapter implements HuertaAccessPort {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(BOGOTA_CLOCK) private readonly clock: BogotaClockPort,
  ) {}

  async hasCheckedInToday(userId: string): Promise<boolean> {
    const row = await this.prisma.reservation.findFirst({
      where: {
        userId,
        status: PrismaReservationStatus.CHECKED_IN,
        date: this.clock.today(),
      },
    });
    return row !== null;
  }
}
