import { Inject, Injectable } from '@nestjs/common';
import { ReservationStatus as PrismaReservationStatus } from '@prisma/client';

import {
    BOGOTA_CLOCK,
    BogotaClockPort,
} from '../../../../../common/time/bogota-clock';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { ReservationContextPort } from '../../../application/ports/out/reservation-context.port';
import { MenuType } from '../../../domain/enums/menu-type.enum';

/**
 * Resolves the guest's active menu context by reading the Reservation table
 * directly (no dependency on the reservations module). Picks the most recent
 * check-in of today (max updatedAt among today's CHECKED_IN) and maps its
 * reservation type to a MenuType (AD-1 / AD-5).
 */
@Injectable()
export class ReservationContextPrismaAdapter implements ReservationContextPort {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(BOGOTA_CLOCK) private readonly clock: BogotaClockPort,
  ) {}

  async resolveActiveMenuType(userId: string): Promise<MenuType | null> {
    const row = await this.prisma.reservation.findFirst({
      where: {
        userId,
        status: PrismaReservationStatus.CHECKED_IN,
        date: this.clock.today(),
      },
      orderBy: { updatedAt: 'desc' },
    });
    if (row === null) {
      return null;
    }
    return row.type as unknown as MenuType;
  }
}
