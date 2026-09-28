import { HuertaItem } from '../../../domain/entities/huerta-item.entity';
import { HuertaItemType } from '../../../domain/enums/huerta-item-type.enum';

export const UPDATE_HUERTA_ITEM_USE_CASE = Symbol('UPDATE_HUERTA_ITEM_USE_CASE');

export interface UpdateHuertaItemCommand {
  type?: HuertaItemType;
  title?: string;
  description?: string | null;
  mediaUrl?: string;
  posterUrl?: string | null;
  order?: number;
  active?: boolean;
}

export interface UpdateHuertaItemUseCasePort {
  execute(id: string, command: UpdateHuertaItemCommand): Promise<HuertaItem>;
}
