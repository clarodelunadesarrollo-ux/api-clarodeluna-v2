import { VrExperience } from '../../../domain/entities/vr-experience.entity';

export const GET_VR_EXPERIENCE_USE_CASE = Symbol('GET_VR_EXPERIENCE_USE_CASE');

export interface GetVrExperienceUseCasePort {
  execute(): Promise<VrExperience>;
}
