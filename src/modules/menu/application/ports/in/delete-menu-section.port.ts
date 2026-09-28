export const DELETE_MENU_SECTION_USE_CASE = Symbol('DELETE_MENU_SECTION_USE_CASE');

export interface DeleteMenuSectionUseCasePort {
  execute(id: string): Promise<void>;
}
