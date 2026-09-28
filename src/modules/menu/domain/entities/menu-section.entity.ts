import { MenuType } from '../enums/menu-type.enum';
import { InvalidMenuSectionException } from '../exceptions/invalid-menu-section.exception';
import { MenuDish } from './menu-dish.entity';

export interface MenuSectionSnapshot {
  id: string;
  menuType: MenuType;
  title: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  dishes: MenuDish[];
}

// Attributes required to create/update a section, before persistence assigns
// id/timestamps. Validated by MenuSection.validate().
export interface MenuSectionAttributes {
  menuType: MenuType;
  title: string;
  order: number;
  active: boolean;
}

export class MenuSection {
  private constructor(
    private readonly _id: string,
    private readonly _menuType: MenuType,
    private readonly _title: string,
    private readonly _order: number,
    private readonly _active: boolean,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
    private readonly _dishes: MenuDish[],
  ) {}

  static rehydrate(snapshot: MenuSectionSnapshot): MenuSection {
    return new MenuSection(
      snapshot.id,
      snapshot.menuType,
      snapshot.title,
      snapshot.order,
      snapshot.active,
      snapshot.createdAt,
      snapshot.updatedAt,
      snapshot.dishes,
    );
  }

  // Guards the domain invariants shared by create and update.
  static validate(attributes: MenuSectionAttributes): MenuSectionAttributes {
    const title = attributes.title.trim();

    if (title.length === 0) {
      throw new InvalidMenuSectionException(
        'title must not be empty',
        'El título de la sección es obligatorio.',
      );
    }
    if (!Object.values(MenuType).includes(attributes.menuType)) {
      throw new InvalidMenuSectionException(
        'menuType must be a valid MenuType',
        'El tipo de menú no es válido.',
      );
    }
    if (!Number.isInteger(attributes.order) || attributes.order < 0) {
      throw new InvalidMenuSectionException(
        'order must be an integer >= 0',
        'El orden de la sección debe ser un número mayor o igual a 0.',
      );
    }

    return {
      menuType: attributes.menuType,
      title,
      order: attributes.order,
      active: attributes.active,
    };
  }

  get id(): string {
    return this._id;
  }

  get menuType(): MenuType {
    return this._menuType;
  }

  get title(): string {
    return this._title;
  }

  get order(): number {
    return this._order;
  }

  get active(): boolean {
    return this._active;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get dishes(): MenuDish[] {
    return this._dishes;
  }
}
