import { HuertaItem } from '../../../domain/entities/huerta-item.entity';

export const LIST_ALL_HUERTA_ITEMS_USE_CASE = Symbol('LIST_ALL_HUERTA_ITEMS_USE_CASE');

export interface ListAllHuertaItemsUseCasePort {
  execute(): Promise<HuertaItem[]>;
}
