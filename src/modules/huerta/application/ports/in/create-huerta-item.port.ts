import { HuertaItem } from '../../../domain/entities/huerta-item.entity';
import { HuertaItemType } from '../../../domain/enums/huerta-item-type.enum';

export const CREATE_HUERTA_ITEM_USE_CASE = Symbol('CREATE_HUERTA_ITEM_USE_CASE');

export interface CreateHuertaItemCommand {
  type: HuertaItemType;
  title: string;
  description?: string | null;
  mediaUrl: string;
  posterUrl?: string | null;
  order: number;
  active?: boolean;
}

export interface CreateHuertaItemUseCasePort {
  execute(command: CreateHuertaItemCommand): Promise<HuertaItem>;
}
