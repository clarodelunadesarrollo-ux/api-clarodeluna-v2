import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    ReservationBlackoutInput,
    ReservationBlackoutRepositoryPort,
    ReservationBlackoutView,
} from '../../../application/ports/out/reservation-blackout-repository.port';
import { BlackoutAlreadyExistsException } from '../../../domain/exceptions/blackout-already-exists.exception';
import { BlackoutNotFoundException } from '../../../domain/exceptions/blackout-not-found.exception';
import { ReservationBlackoutMapper } from '../mappers/reservation-blackout.mapper';

@Injectable()
export class ReservationBlackoutPrismaRepository
  implements ReservationBlackoutRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ReservationBlackoutView[]> {
    const rows = await this.prisma.reservationBlackout.findMany({
      orderBy: { date: 'asc' },
    });
    return rows.map((row) => ReservationBlackoutMapper.toView(row));
  }

  async findByDate(date: Date): Promise<ReservationBlackoutView | null> {
    const row = await this.prisma.reservationBlackout.findUnique({
      where: { date },
    });
    return row ? ReservationBlackoutMapper.toView(row) : null;
  }

  async create(
    input: ReservationBlackoutInput,
  ): Promise<ReservationBlackoutView> {
    try {
      const row = await this.prisma.reservationBlackout.create({
        data: {
          date: input.date,
          scope: input.scope,
          reason: input.reason,
        },
      });
      return ReservationBlackoutMapper.toView(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BlackoutAlreadyExistsException();
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.reservationBlackout.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new BlackoutNotFoundException();
      }
      throw error;
    }
  }
}
