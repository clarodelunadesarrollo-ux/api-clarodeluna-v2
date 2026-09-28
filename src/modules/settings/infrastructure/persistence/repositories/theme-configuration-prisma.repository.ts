import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../../prisma/prisma.service';
import { ThemeConfigurationRepositoryPort } from '../../../application/ports/out/theme-configuration-repository.port';
import { ThemeConfiguration } from '../../../domain/entities/theme-configuration.entity';
import {
    THEME_CONFIGURATION_ID,
    ThemeConfigurationData,
} from '../../../domain/theme-configuration';
import { ThemeConfigurationMapper } from '../mappers/theme-configuration.mapper';

@Injectable()
export class ThemeConfigurationPrismaRepository
  implements ThemeConfigurationRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async find(): Promise<ThemeConfiguration | null> {
    const row = await this.prisma.themeConfiguration.findUnique({
      where: { id: THEME_CONFIGURATION_ID },
    });
    return row ? ThemeConfigurationMapper.toDomain(row) : null;
  }

  async upsert(data: ThemeConfigurationData): Promise<ThemeConfiguration> {
    const columns = this.toColumns(data);
    const row = await this.prisma.themeConfiguration.upsert({
      where: { id: THEME_CONFIGURATION_ID },
      create: { id: THEME_CONFIGURATION_ID, ...columns },
      update: columns,
    });
    return ThemeConfigurationMapper.toDomain(row);
  }

  private toColumns(
    data: ThemeConfigurationData,
  ): Prisma.ThemeConfigurationUncheckedCreateInput {
    const isCustom = data.paletteSource === 'CUSTOM';
    return {
      mode: data.mode,
      titleFontFamily: data.title.fontFamily,
      titleFontWeight: data.title.fontWeight,
      subtitleFontFamily: data.subtitle.fontFamily,
      subtitleFontWeight: data.subtitle.fontWeight,
      bodyFontFamily: data.body.fontFamily,
      bodyFontWeight: data.body.fontWeight,
      paletteSource: data.paletteSource,
      presetKey: data.paletteSource === 'PRESET' ? data.presetKey : null,
      customPalette:
        isCustom && data.custom
          ? (data.custom as unknown as Prisma.InputJsonValue)
          : Prisma.DbNull,
    };
  }
}
