import { InvalidPromoCardException } from '../exceptions/invalid-promo-card.exception';

export interface PromoCardSnapshot {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  icon: string | null;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Attributes required to create/update a card, before persistence assigns
// id/timestamps. Validated by PromoCard.validate().
export interface PromoCardAttributes {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  icon: string | null;
  order: number;
  active: boolean;
}

export class PromoCard {
  private constructor(
    private readonly _id: string,
    private readonly _title: string,
    private readonly _subtitle: string,
    private readonly _imageUrl: string | null,
    private readonly _icon: string | null,
    private readonly _order: number,
    private readonly _active: boolean,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  static rehydrate(snapshot: PromoCardSnapshot): PromoCard {
    return new PromoCard(
      snapshot.id,
      snapshot.title,
      snapshot.subtitle,
      snapshot.imageUrl,
      snapshot.icon,
      snapshot.order,
      snapshot.active,
      snapshot.createdAt,
      snapshot.updatedAt,
    );
  }

  // Guards the domain invariants shared by create and update. Trims text and
  // normalizes empty optional fields (imageUrl/icon) to null.
  static validate(attributes: PromoCardAttributes): PromoCardAttributes {
    const title = attributes.title.trim();
    const subtitle = attributes.subtitle.trim();
    const imageUrl =
      attributes.imageUrl === null ? null : attributes.imageUrl.trim();
    const icon = attributes.icon === null ? null : attributes.icon.trim();

    if (title.length === 0) {
      throw new InvalidPromoCardException(
        'title must not be empty',
        'El título de la tarjeta es obligatorio.',
      );
    }
    if (subtitle.length === 0) {
      throw new InvalidPromoCardException(
        'subtitle must not be empty',
        'El subtítulo de la tarjeta es obligatorio.',
      );
    }
    if (!Number.isInteger(attributes.order) || attributes.order < 0) {
      throw new InvalidPromoCardException(
        'order must be an integer >= 0',
        'El orden de la tarjeta debe ser un número mayor o igual a 0.',
      );
    }

    const normalizedImageUrl =
      imageUrl !== null && imageUrl.length > 0 ? imageUrl : null;
    const normalizedIcon = icon !== null && icon.length > 0 ? icon : null;

    return {
      title,
      subtitle,
      imageUrl: normalizedImageUrl,
      icon: normalizedIcon,
      order: attributes.order,
      active: attributes.active,
    };
  }

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get subtitle(): string {
    return this._subtitle;
  }

  get imageUrl(): string | null {
    return this._imageUrl;
  }

  get icon(): string | null {
    return this._icon;
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
