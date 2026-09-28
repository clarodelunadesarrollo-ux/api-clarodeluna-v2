export const DELETE_PROMO_USE_CASE = Symbol('DELETE_PROMO_USE_CASE');

export interface DeletePromoUseCasePort {
  execute(id: string): Promise<void>;
}
