import { HuertaItem } from '../../../domain/entities/huerta-item.entity';
import { HuertaItemType } from '../../../domain/enums/huerta-item-type.enum';

export const HUERTA_ITEM_REPOSITORY = Symbol('HUERTA_ITEM_REPOSITORY');

export interface CreateHuertaItemData {
  type: HuertaItemType;
  title: string;
  description: string | null;
  mediaUrl: string;
  posterUrl: string | null;
  order: number;
  active: boolean;
}

export interface UpdateHuertaItemData {
  type?: HuertaItemType;
  title?: string;
  description?: string | null;
  mediaUrl?: string;
  posterUrl?: string | null;
  order?: number;
  active?: boolean;
}

export interface HuertaItemRepositoryPort {
  // Active items ordered by `order` asc, for the guest app.
  findActiveOrdered(): Promise<HuertaItem[]>;
  // All items (active and inactive) ordered by `order` asc, for the admin.
  findAllOrdered(): Promise<HuertaItem[]>;
  findById(id: string): Promise<HuertaItem | null>;
  create(data: CreateHuertaItemData): Promise<HuertaItem>;
  update(id: string, data: UpdateHuertaItemData): Promise<HuertaItem>;
  delete(id: string): Promise<void>;
}
