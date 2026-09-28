import { Controller, Get, Inject } from '@nestjs/common';

import {
    GET_VR_EXPERIENCE_USE_CASE,
    GetVrExperienceUseCasePort,
} from '../../application/ports/in/get-vr-experience.port';
import { VrExperienceResponseDto } from '../dtos/vr-experience-response.dto';

// Guest surface, protected by the global JwtAuthGuard. Returns the current VR
// experience (title + video URL) so the app can play it after the simulated
// headset-connection flow.
@Controller('vr')
export class VrController {
  constructor(
    @Inject(GET_VR_EXPERIENCE_USE_CASE)
    private readonly getExperience: GetVrExperienceUseCasePort,
  ) {}

  @Get('experience')
  async get(): Promise<VrExperienceResponseDto> {
    const experience = await this.getExperience.execute();
    return new VrExperienceResponseDto(experience);
  }
}
