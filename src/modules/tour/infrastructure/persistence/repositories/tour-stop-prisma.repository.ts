import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    CreateTourStopData,
    TourStopRepositoryPort,
    UpdateTourStopData,
} from '../../../application/ports/out/tour-stop-repository.port';
import { TourStop } from '../../../domain/entities/tour-stop.entity';
import { TourStopMapper } from '../mappers/tour-stop.mapper';

@Injectable()
export class TourStopPrismaRepository implements TourStopRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActiveOrdered(): Promise<TourStop[]> {
    const rows = await this.prisma.tourStop.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    return rows.map((row) => TourStopMapper.toDomain(row));
  }

  async findById(id: string): Promise<TourStop | null> {
    const row = await this.prisma.tourStop.findUnique({ where: { id } });
    return row ? TourStopMapper.toDomain(row) : null;
  }

  async create(data: CreateTourStopData): Promise<TourStop> {
    const row = await this.prisma.tourStop.create({ data });
    return TourStopMapper.toDomain(row);
  }

  async update(id: string, data: UpdateTourStopData): Promise<TourStop> {
    const row = await this.prisma.tourStop.update({ where: { id }, data });
    return TourStopMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tourStop.delete({ where: { id } });
  }
}
