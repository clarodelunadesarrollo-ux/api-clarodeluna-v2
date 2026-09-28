import { MenuView } from '../../application/ports/in/get-menu.port';
import { MenuDish } from '../../domain/entities/menu-dish.entity';
import { MenuSection } from '../../domain/entities/menu-section.entity';
import { MenuType } from '../../domain/enums/menu-type.enum';

class MenuDishResponseDto {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly priceCents: number | null;
  readonly tags: string[];

  constructor(dish: MenuDish) {
    this.id = dish.id;
    this.name = dish.name;
    this.description = dish.description;
    this.imageUrl = dish.imageUrl;
    this.priceCents = dish.priceCents;
    this.tags = dish.tags;
  }
}

class MenuSectionResponseDto {
  readonly id: string;
  readonly title: string;
  readonly order: number;
  readonly dishes: MenuDishResponseDto[];

  constructor(section: MenuSection) {
    this.id = section.id;
    this.title = section.title;
    this.order = section.order;
    this.dishes = section.dishes.map((dish) => new MenuDishResponseDto(dish));
  }
}

export class MenuResponseDto {
  readonly menuType: MenuType;
  readonly sections: MenuSectionResponseDto[];

  constructor(view: MenuView) {
    this.menuType = view.menuType;
    this.sections = view.sections.map(
      (section) => new MenuSectionResponseDto(section),
    );
  }
}
