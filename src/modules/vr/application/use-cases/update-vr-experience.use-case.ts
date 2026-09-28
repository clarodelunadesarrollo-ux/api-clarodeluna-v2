import { VrExperience } from '../../domain/entities/vr-experience.entity';
import {
    UpdateVrExperienceInput,
    UpdateVrExperienceUseCasePort,
} from '../ports/in/update-vr-experience.port';
import { VrExperienceRepositoryPort } from '../ports/out/vr-experience-repository.port';

export class UpdateVrExperienceUseCase
  implements UpdateVrExperienceUseCasePort
{
  constructor(private readonly experiences: VrExperienceRepositoryPort) {}

  async execute(input: UpdateVrExperienceInput): Promise<VrExperience> {
    const attributes = VrExperience.validate(input);
    return this.experiences.saveCurrent(attributes);
  }
}
