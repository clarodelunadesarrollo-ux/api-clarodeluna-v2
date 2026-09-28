import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    SaveVrExperienceData,
    VrExperienceRepositoryPort,
} from '../../../application/ports/out/vr-experience-repository.port';
import { VrExperience } from '../../../domain/entities/vr-experience.entity';
import { VrExperienceMapper } from '../mappers/vr-experience.mapper';

@Injectable()
export class VrExperiencePrismaRepository
  implements VrExperienceRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async findCurrent(): Promise<VrExperience | null> {
    const row = await this.prisma.vrExperience.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    return row ? VrExperienceMapper.toDomain(row) : null;
  }

  async saveCurrent(data: SaveVrExperienceData): Promise<VrExperience> {
    const current = await this.prisma.vrExperience.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    const row =
      current === null
        ? await this.prisma.vrExperience.create({ data })
        : await this.prisma.vrExperience.update({
            where: { id: current.id },
            data,
          });
    return VrExperienceMapper.toDomain(row);
  }
}
