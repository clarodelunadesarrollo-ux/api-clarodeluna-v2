import { AppSetting as PrismaAppSetting } from '@prisma/client';

import { AppSetting } from '../../../domain/entities/app-setting.entity';

export class AppSettingMapper {
  static toDomain(row: PrismaAppSetting): AppSetting {
    return AppSetting.rehydrate({
      key: row.key,
      value: row.value,
      updatedAt: row.updatedAt,
    });
  }
}
