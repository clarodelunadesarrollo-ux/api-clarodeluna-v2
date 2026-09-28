import { VrExperience } from '../../domain/entities/vr-experience.entity';
import { VrExperienceNotFoundException } from '../../domain/exceptions/vr-experience-not-found.exception';
import { GetVrExperienceUseCasePort } from '../ports/in/get-vr-experience.port';
import { VrExperienceRepositoryPort } from '../ports/out/vr-experience-repository.port';

export class GetVrExperienceUseCase implements GetVrExperienceUseCasePort {
  constructor(private readonly experiences: VrExperienceRepositoryPort) {}

  async execute(): Promise<VrExperience> {
    const experience = await this.experiences.findCurrent();
    if (experience === null) {
      throw new VrExperienceNotFoundException();
    }
    return experience;
  }
}
