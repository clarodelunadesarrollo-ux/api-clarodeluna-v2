import { InvalidMenuDishException } from '../exceptions/invalid-menu-dish.exception';

export interface MenuDishSnapshot {
  id: string;
  sectionId: string;
  name: string;
  description: string;
  imageUrl: string;
  priceCents: number | null;
  tags: string[];
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Attributes required to create/update a dish, before persistence assigns
// id/timestamps. Validated by MenuDish.validate().
export interface MenuDishAttributes {
  sectionId: string;
  name: string;
  description: string;
  imageUrl: string;
  priceCents: number | null;
  tags: string[];
  order: number;
  active: boolean;
}

export class MenuDish {
  private constructor(
    private readonly _id: string,
    private readonly _sectionId: string,
    private readonly _name: string,
    private readonly _description: string,
    private readonly _imageUrl: string,
    private readonly _priceCents: number | null,
    private readonly _tags: string[],
    private readonly _order: number,
    private readonly _active: boolean,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  static rehydrate(snapshot: MenuDishSnapshot): MenuDish {
    return new MenuDish(
      snapshot.id,
      snapshot.sectionId,
      snapshot.name,
      snapshot.description,
      snapshot.imageUrl,
      snapshot.priceCents,
      snapshot.tags,
      snapshot.order,
      snapshot.active,
      snapshot.createdAt,
      snapshot.updatedAt,
    );
  }

  // Guards the domain invariants shared by create and update.
  static validate(attributes: MenuDishAttributes): MenuDishAttributes {
    const name = attributes.name.trim();
    const description = attributes.description.trim();
    const imageUrl = attributes.imageUrl.trim();

    if (name.length === 0) {
      throw new InvalidMenuDishException(
        'name must not be empty',
        'El nombre del plato es obligatorio.',
      );
    }
    if (description.length === 0) {
      throw new InvalidMenuDishException(
        'description must not be empty',
        'La descripción del plato es obligatoria.',
      );
    }
    if (imageUrl.length === 0) {
      throw new InvalidMenuDishException(
        'imageUrl must not be empty',
        'La imagen del plato es obligatoria.',
      );
    }
    if (
      attributes.priceCents !== null &&
      (!Number.isInteger(attributes.priceCents) || attributes.priceCents < 0)
    ) {
      throw new InvalidMenuDishException(
        'priceCents must be an integer >= 0 or null',
        'El precio del plato no es válido.',
      );
    }
    if (!Number.isInteger(attributes.order) || attributes.order < 0) {
      throw new InvalidMenuDishException(
        'order must be an integer >= 0',
        'El orden del plato debe ser un número mayor o igual a 0.',
      );
    }

    const tags = attributes.tags.map((tag) => tag.trim());
    if (tags.some((tag) => tag.length === 0)) {
      throw new InvalidMenuDishException(
        'tags must not contain empty values',
        'Las etiquetas de dieta no pueden estar vacías.',
      );
    }

    return {
      sectionId: attributes.sectionId,
      name,
      description,
      imageUrl,
      priceCents: attributes.priceCents,
      tags,
      order: attributes.order,
      active: attributes.active,
    };
  }

  get id(): string {
    return this._id;
  }

  get sectionId(): string {
    return this._sectionId;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get priceCents(): number | null {
    return this._priceCents;
  }

  get tags(): string[] {
    return this._tags;
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
}
