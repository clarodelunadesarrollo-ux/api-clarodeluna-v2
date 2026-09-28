export const DELETE_MENU_DISH_USE_CASE = Symbol('DELETE_MENU_DISH_USE_CASE');

export interface DeleteMenuDishUseCasePort {
  execute(id: string): Promise<void>;
}
