import { Injectable } from '@nestjs/common';
import {
    ReservationStatus as PrismaReservationStatus,
    ReservationType as PrismaReservationType,
} from '@prisma/client';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    NewReservation,
    ReservationChanges,
    ReservationFilter,
    ReservationRepositoryPort,
} from '../../../application/ports/out/reservation-repository.port';
import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/enums/reservation-status.enum';
import { ReservationMapper } from '../mappers/reservation.mapper';

@Injectable()
export class ReservationPrismaRepository implements ReservationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: NewReservation): Promise<Reservation> {
    const row = await this.prisma.reservation.create({
      data: {
        userId: data.userId,
        type: data.type as PrismaReservationType,
        date: data.date,
        time: data.time,
        partySize: data.partySize,
        holderName: data.holderName,
      },
    });
    return ReservationMapper.toDomain(row);
  }

  async findById(id: string): Promise<Reservation | null> {
    const row = await this.prisma.reservation.findUnique({ where: { id } });
    return row ? ReservationMapper.toDomain(row) : null;
  }

  async findByUserId(userId: string): Promise<Reservation[]> {
    const rows = await this.prisma.reservation.findMany({
      where: { userId },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
    return rows.map((row) => ReservationMapper.toDomain(row));
  }

  async findAll(filter?: ReservationFilter): Promise<Reservation[]> {
    const rows = await this.prisma.reservation.findMany({
      where: {
        ...(filter?.type
          ? { type: filter.type as PrismaReservationType }
          : {}),
        ...(filter?.status
          ? { status: filter.status as PrismaReservationStatus }
          : {}),
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
    return rows.map((row) => ReservationMapper.toDomain(row));
  }

  countActiveToursFrom(userId: string, fromDate: Date): Promise<number> {
    return this.prisma.reservation.count({
      where: {
        userId,
        type: PrismaReservationType.TOUR,
        status: PrismaReservationStatus.ACTIVE,
        date: { gte: fromDate },
      },
    });
  }

  async update(id: string, changes: ReservationChanges): Promise<Reservation> {
    const row = await this.prisma.reservation.update({
      where: { id },
      data: {
        ...(changes.date !== undefined ? { date: changes.date } : {}),
        ...(changes.time !== undefined ? { time: changes.time } : {}),
        ...(changes.partySize !== undefined
          ? { partySize: changes.partySize }
          : {}),
        ...(changes.status !== undefined
          ? { status: changes.status as PrismaReservationStatus }
          : {}),
      },
    });
    return ReservationMapper.toDomain(row);
  }

  async updateStatus(
    id: string,
    status: ReservationStatus,
  ): Promise<Reservation> {
    const row = await this.prisma.reservation.update({
      where: { id },
      data: { status: status as PrismaReservationStatus },
    });
    return ReservationMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reservation.delete({ where: { id } });
  }
}
