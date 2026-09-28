import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    CreateThemePresetData,
    ThemePresetRepositoryPort,
    UpdateThemePresetData,
} from '../../../application/ports/out/theme-preset-repository.port';
import { ThemePreset } from '../../../domain/theme-configuration';
import { ThemePresetMapper } from '../mappers/theme-preset.mapper';

@Injectable()
export class ThemePresetPrismaRepository implements ThemePresetRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ThemePreset[]> {
    const rows = await this.prisma.themePreset.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((row) => ThemePresetMapper.toDomain(row));
  }

  async findByKey(key: string): Promise<ThemePreset | null> {
    const row = await this.prisma.themePreset.findUnique({ where: { key } });
    return row ? ThemePresetMapper.toDomain(row) : null;
  }

  async create(data: CreateThemePresetData): Promise<ThemePreset> {
    const row = await this.prisma.themePreset.create({
      data: {
        key: data.key,
        name: data.name,
        description: data.description,
        suggestedUse: data.suggestedUse,
        sortOrder: data.sortOrder,
        isDefault: data.isDefault,
        palette: data.palette as unknown as Prisma.InputJsonValue,
        semantic: data.semantic as unknown as Prisma.InputJsonValue,
      },
    });
    return ThemePresetMapper.toDomain(row);
  }

  async update(
    key: string,
    data: UpdateThemePresetData,
  ): Promise<ThemePreset> {
    const patch: Prisma.ThemePresetUpdateInput = {};
    if (data.name !== undefined) {
      patch.name = data.name;
    }
    if (data.description !== undefined) {
      patch.description = data.description;
    }
    if (data.suggestedUse !== undefined) {
      patch.suggestedUse = data.suggestedUse;
    }
    if (data.sortOrder !== undefined) {
      patch.sortOrder = data.sortOrder;
    }
    if (data.palette !== undefined) {
      patch.palette = data.palette as unknown as Prisma.InputJsonValue;
    }
    if (data.semantic !== undefined) {
      patch.semantic = data.semantic as unknown as Prisma.InputJsonValue;
    }

    const row = await this.prisma.themePreset.update({
      where: { key },
      data: patch,
    });
    return ThemePresetMapper.toDomain(row);
  }

  async delete(key: string): Promise<void> {
    await this.prisma.themePreset.delete({ where: { key } });
  }
}
