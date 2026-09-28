import { VrExperience } from '../../domain/entities/vr-experience.entity';

export class VrExperienceResponseDto {
  readonly id: string;
  readonly title: string;
  readonly videoUrl: string;
  readonly updatedAt: string;

  constructor(experience: VrExperience) {
    this.id = experience.id;
    this.title = experience.title;
    this.videoUrl = experience.videoUrl;
    this.updatedAt = experience.updatedAt.toISOString();
  }
}
