import { VrExperience } from '../../../domain/entities/vr-experience.entity';

export const UPDATE_VR_EXPERIENCE_USE_CASE = Symbol(
  'UPDATE_VR_EXPERIENCE_USE_CASE',
);

export interface UpdateVrExperienceInput {
  title: string;
  videoUrl: string;
}

export interface UpdateVrExperienceUseCasePort {
  execute(input: UpdateVrExperienceInput): Promise<VrExperience>;
}
