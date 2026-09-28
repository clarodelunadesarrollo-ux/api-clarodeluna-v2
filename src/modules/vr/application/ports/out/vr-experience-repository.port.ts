import { VrExperience } from '../../../domain/entities/vr-experience.entity';

export const VR_EXPERIENCE_REPOSITORY = Symbol('VR_EXPERIENCE_REPOSITORY');

export interface SaveVrExperienceData {
  title: string;
  videoUrl: string;
}

export interface VrExperienceRepositoryPort {
  // The current (singleton) experience, or null when none is configured yet.
  findCurrent(): Promise<VrExperience | null>;
  // Upserts the singleton: updates the current row if present, else creates it.
  saveCurrent(data: SaveVrExperienceData): Promise<VrExperience>;
}
