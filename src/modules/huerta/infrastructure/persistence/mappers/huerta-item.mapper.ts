import { HuertaItem as PrismaHuertaItem } from '@prisma/client';

import { HuertaItem } from '../../../domain/entities/huerta-item.entity';
import { HuertaItemType } from '../../../domain/enums/huerta-item-type.enum';

export class HuertaItemMapper {
  static toDomain(row: PrismaHuertaItem): HuertaItem {
    return HuertaItem.rehydrate({
      id: row.id,
      type: row.type as unknown as HuertaItemType,
      title: row.title,
      description: row.description,
      mediaUrl: row.mediaUrl,
      posterUrl: row.posterUrl,
      order: row.order,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
