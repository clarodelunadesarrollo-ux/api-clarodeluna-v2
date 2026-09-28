export const DELETE_HUERTA_ITEM_USE_CASE = Symbol('DELETE_HUERTA_ITEM_USE_CASE');

export interface DeleteHuertaItemUseCasePort {
  execute(id: string): Promise<void>;
}
