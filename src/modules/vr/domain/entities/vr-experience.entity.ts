import { InvalidVrExperienceException } from '../exceptions/invalid-vr-experience.exception';

export interface VrExperienceSnapshot {
  id: string;
  title: string;
  videoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

// Attributes required to create/update the experience, before persistence
// assigns id/timestamps. Validated by VrExperience.validate().
export interface VrExperienceAttributes {
  title: string;
  videoUrl: string;
}

export class VrExperience {
  private constructor(
    private readonly _id: string,
    private readonly _title: string,
    private readonly _videoUrl: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  static rehydrate(snapshot: VrExperienceSnapshot): VrExperience {
    return new VrExperience(
      snapshot.id,
      snapshot.title,
      snapshot.videoUrl,
      snapshot.createdAt,
      snapshot.updatedAt,
    );
  }

  // Guards the domain invariants shared by create and update.
  static validate(attributes: VrExperienceAttributes): VrExperienceAttributes {
    const title = attributes.title.trim();
    const videoUrl = attributes.videoUrl.trim();

    if (title.length === 0) {
      throw new InvalidVrExperienceException(
        'title must not be empty',
        'El título de la experiencia es obligatorio.',
      );
    }
    if (!VrExperience.isHttpUrl(videoUrl)) {
      throw new InvalidVrExperienceException(
        'videoUrl must be a valid http(s) URL',
        'La URL del video debe ser una dirección http(s) válida.',
      );
    }

    return { title, videoUrl };
  }

  private static isHttpUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get videoUrl(): string {
    return this._videoUrl;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
