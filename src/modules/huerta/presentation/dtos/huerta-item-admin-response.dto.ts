import { HuertaItem } from '../../domain/entities/huerta-item.entity';
import { HuertaItemType } from '../../domain/enums/huerta-item-type.enum';

export class HuertaItemAdminResponseDto {
  readonly id: string;
  readonly type: HuertaItemType;
  readonly title: string;
  readonly description: string | null;
  readonly mediaUrl: string;
  readonly posterUrl: string | null;
  readonly order: number;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(item: HuertaItem) {
    this.id = item.id;
    this.type = item.type;
    this.title = item.title;
    this.description = item.description;
    this.mediaUrl = item.mediaUrl;
    this.posterUrl = item.posterUrl;
    this.order = item.order;
    this.active = item.active;
    this.createdAt = item.createdAt.toISOString();
    this.updatedAt = item.updatedAt.toISOString();
  }
}
