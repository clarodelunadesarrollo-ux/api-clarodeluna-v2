import { HuertaItem } from '../../../domain/entities/huerta-item.entity';

export const GET_HUERTA_USE_CASE = Symbol('GET_HUERTA_USE_CASE');

export interface GetHuertaUseCasePort {
  execute(userId: string): Promise<HuertaItem[]>;
}
