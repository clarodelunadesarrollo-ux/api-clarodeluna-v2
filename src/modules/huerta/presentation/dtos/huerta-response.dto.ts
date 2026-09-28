import { HuertaItem } from '../../domain/entities/huerta-item.entity';
import { HuertaItemType } from '../../domain/enums/huerta-item-type.enum';

class HuertaItemResponseDto {
  readonly id: string;
  readonly type: HuertaItemType;
  readonly title: string;
  readonly description: string | null;
  readonly mediaUrl: string;
  readonly posterUrl: string | null;

  constructor(item: HuertaItem) {
    this.id = item.id;
    this.type = item.type;
    this.title = item.title;
    this.description = item.description;
    this.mediaUrl = item.mediaUrl;
    this.posterUrl = item.posterUrl;
  }
}

export class HuertaResponseDto {
  readonly items: HuertaItemResponseDto[];

  constructor(items: HuertaItem[]) {
    this.items = items.map((item) => new HuertaItemResponseDto(item));
  }
}
