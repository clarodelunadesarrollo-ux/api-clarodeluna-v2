import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../prisma/prisma.service';
import { AppSettingRepositoryPort } from '../../../application/ports/out/app-setting-repository.port';
import { AppSetting } from '../../../domain/entities/app-setting.entity';
import { AppSettingMapper } from '../mappers/app-setting.mapper';

@Injectable()
export class AppSettingPrismaRepository implements AppSettingRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByKey(key: string): Promise<AppSetting | null> {
    const row = await this.prisma.appSetting.findUnique({ where: { key } });
    return row ? AppSettingMapper.toDomain(row) : null;
  }

  async upsert(key: string, value: string): Promise<AppSetting> {
    const row = await this.prisma.appSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    return AppSettingMapper.toDomain(row);
  }
}
