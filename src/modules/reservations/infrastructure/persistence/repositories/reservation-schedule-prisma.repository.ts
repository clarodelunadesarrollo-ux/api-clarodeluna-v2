import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    ReservationScheduleInput,
    ReservationScheduleRepositoryPort,
    ReservationScheduleView,
} from '../../../application/ports/out/reservation-schedule-repository.port';
import { ReservationType } from '../../../domain/enums/reservation-type.enum';
import { ReservationScheduleMapper } from '../mappers/reservation-schedule.mapper';

@Injectable()
export class ReservationSchedulePrismaRepository
  implements ReservationScheduleRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async findByType(
    type: ReservationType,
  ): Promise<ReservationScheduleView | null> {
    const row = await this.prisma.reservationSchedule.findUnique({
      where: { type },
    });
    return row ? ReservationScheduleMapper.toView(row) : null;
  }

  async findAll(): Promise<ReservationScheduleView[]> {
    const rows = await this.prisma.reservationSchedule.findMany({
      orderBy: { type: 'asc' },
    });
    return rows.map((row) => ReservationScheduleMapper.toView(row));
  }

  async upsert(
    type: ReservationType,
    input: ReservationScheduleInput,
  ): Promise<ReservationScheduleView> {
    const row = await this.prisma.reservationSchedule.upsert({
      where: { type },
      create: { type, ...input },
      update: { ...input },
    });
    return ReservationScheduleMapper.toView(row);
  }
}
