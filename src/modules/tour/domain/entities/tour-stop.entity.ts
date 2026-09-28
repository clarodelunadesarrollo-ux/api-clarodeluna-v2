import { InvalidTourStopException } from '../exceptions/invalid-tour-stop.exception';

export interface TourStopSnapshot {
  id: string;
  order: number;
  title: string;
  description: string;
  positionX: number;
  positionY: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Attributes required to create/update a stop, before persistence assigns
// id/timestamps. Validated by TourStop.validate().
export interface TourStopAttributes {
  order: number;
  title: string;
  description: string;
  positionX: number;
  positionY: number;
  active: boolean;
}

export class TourStop {
  private constructor(
    private readonly _id: string,
    private readonly _order: number,
    private readonly _title: string,
    private readonly _description: string,
    private readonly _positionX: number,
    private readonly _positionY: number,
    private readonly _active: boolean,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  static rehydrate(snapshot: TourStopSnapshot): TourStop {
    return new TourStop(
      snapshot.id,
      snapshot.order,
      snapshot.title,
      snapshot.description,
      snapshot.positionX,
      snapshot.positionY,
      snapshot.active,
      snapshot.createdAt,
      snapshot.updatedAt,
    );
  }

  // Guards the domain invariants shared by create and update.
  static validate(attributes: TourStopAttributes): TourStopAttributes {
    const title = attributes.title.trim();
    const description = attributes.description.trim();

    if (title.length === 0) {
      throw new InvalidTourStopException(
        'title must not be empty',
        'El título de la parada es obligatorio.',
      );
    }
    if (description.length === 0) {
      throw new InvalidTourStopException(
        'description must not be empty',
        'La descripción de la parada es obligatoria.',
      );
    }
    if (!Number.isInteger(attributes.order) || attributes.order < 1) {
      throw new InvalidTourStopException(
        'order must be an integer >= 1',
        'El orden de la parada debe ser un número mayor o igual a 1.',
      );
    }
    TourStop.ensureRelativePosition(attributes.positionX, 'positionX');
    TourStop.ensureRelativePosition(attributes.positionY, 'positionY');

    return {
      order: attributes.order,
      title,
      description,
      positionX: attributes.positionX,
      positionY: attributes.positionY,
      active: attributes.active,
    };
  }

  private static ensureRelativePosition(value: number, field: string): void {
    if (Number.isNaN(value) || value < 0 || value > 1) {
      throw new InvalidTourStopException(
        `${field} must be between 0 and 1`,
        'Las posiciones deben estar entre 0 y 1.',
      );
    }
  }

  get id(): string {
    return this._id;
  }

  get order(): number {
    return this._order;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get positionX(): number {
    return this._positionX;
  }

  get positionY(): number {
    return this._positionY;
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
