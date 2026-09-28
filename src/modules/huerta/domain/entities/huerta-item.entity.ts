import { HuertaItemType } from '../enums/huerta-item-type.enum';
import { InvalidHuertaItemException } from '../exceptions/invalid-huerta-item.exception';

export interface HuertaItemSnapshot {
  id: string;
  type: HuertaItemType;
  title: string;
  description: string | null;
  mediaUrl: string;
  posterUrl: string | null;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Attributes required to create/update an item, before persistence assigns
// id/timestamps. Validated by HuertaItem.validate().
export interface HuertaItemAttributes {
  type: HuertaItemType;
  title: string;
  description: string | null;
  mediaUrl: string;
  posterUrl: string | null;
  order: number;
  active: boolean;
}

export class HuertaItem {
  private constructor(
    private readonly _id: string,
    private readonly _type: HuertaItemType,
    private readonly _title: string,
    private readonly _description: string | null,
    private readonly _mediaUrl: string,
    private readonly _posterUrl: string | null,
    private readonly _order: number,
    private readonly _active: boolean,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  static rehydrate(snapshot: HuertaItemSnapshot): HuertaItem {
    return new HuertaItem(
      snapshot.id,
      snapshot.type,
      snapshot.title,
      snapshot.description,
      snapshot.mediaUrl,
      snapshot.posterUrl,
      snapshot.order,
      snapshot.active,
      snapshot.createdAt,
      snapshot.updatedAt,
    );
  }

  // Guards the domain invariants shared by create and update.
  static validate(attributes: HuertaItemAttributes): HuertaItemAttributes {
    const title = attributes.title.trim();
    const mediaUrl = attributes.mediaUrl.trim();
    const description =
      attributes.description === null ? null : attributes.description.trim();
    const posterUrl =
      attributes.posterUrl === null ? null : attributes.posterUrl.trim();

    if (title.length === 0) {
      throw new InvalidHuertaItemException(
        'title must not be empty',
        'El título del ítem es obligatorio.',
      );
    }
    if (mediaUrl.length === 0) {
      throw new InvalidHuertaItemException(
        'mediaUrl must not be empty',
        'La URL del contenido es obligatoria.',
      );
    }
    if (!Number.isInteger(attributes.order) || attributes.order < 0) {
      throw new InvalidHuertaItemException(
        'order must be an integer >= 0',
        'El orden del ítem debe ser un número mayor o igual a 0.',
      );
    }

    // Core invariant (AD-3): a VIDEO item must carry a poster so the app never
    // renders a blank thumbnail. IMAGE items ignore the poster (normalized to null).
    if (
      attributes.type === HuertaItemType.VIDEO &&
      (posterUrl === null || posterUrl.length === 0)
    ) {
      throw new InvalidHuertaItemException(
        'posterUrl is required for VIDEO items',
        'Los videos necesitan una imagen de portada.',
      );
    }

    const normalizedPoster =
      attributes.type === HuertaItemType.VIDEO ? posterUrl : null;
    const normalizedDescription =
      description !== null && description.length > 0 ? description : null;

    return {
      type: attributes.type,
      title,
      description: normalizedDescription,
      mediaUrl,
      posterUrl: normalizedPoster,
      order: attributes.order,
      active: attributes.active,
    };
  }

  get id(): string {
    return this._id;
  }

  get type(): HuertaItemType {
    return this._type;
  }

  get title(): string {
    return this._title;
  }

  get description(): string | null {
    return this._description;
  }

  get mediaUrl(): string {
    return this._mediaUrl;
  }

  get posterUrl(): string | null {
    return this._posterUrl;
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
