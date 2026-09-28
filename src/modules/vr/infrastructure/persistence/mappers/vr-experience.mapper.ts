import { VrExperience as PrismaVrExperience } from '@prisma/client';

import { VrExperience } from '../../../domain/entities/vr-experience.entity';

export class VrExperienceMapper {
  static toDomain(row: PrismaVrExperience): VrExperience {
    return VrExperience.rehydrate({
      id: row.id,
      title: row.title,
      videoUrl: row.videoUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
