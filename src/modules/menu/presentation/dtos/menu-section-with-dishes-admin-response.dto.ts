import { MenuSection } from '../../domain/entities/menu-section.entity';
import { MenuType } from '../../domain/enums/menu-type.enum';
import { MenuDishAdminResponseDto } from './menu-dish-admin-response.dto';

// Admin view of a section together with all of its dishes (active and
// inactive), used by the admin panel to render and manage the full menu.
export class MenuSectionWithDishesAdminResponseDto {
  readonly id: string;
  readonly menuType: MenuType;
  readonly title: string;
  readonly order: number;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly dishes: MenuDishAdminResponseDto[];

  constructor(section: MenuSection) {
    this.id = section.id;
    this.menuType = section.menuType;
    this.title = section.title;
    this.order = section.order;
    this.active = section.active;
    this.createdAt = section.createdAt.toISOString();
    this.updatedAt = section.updatedAt.toISOString();
    this.dishes = section.dishes.map(
      (dish) => new MenuDishAdminResponseDto(dish),
    );
  }
}
