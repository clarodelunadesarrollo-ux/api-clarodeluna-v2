import { NotFoundException } from '@nestjs/common';

import { GetProfileUseCasePort } from '../ports/in/get-profile.port';
import {
    ProfileRepositoryPort,
    ProfileView,
} from '../ports/out/profile-repository.port';

export class GetProfileUseCase implements GetProfileUseCasePort {
  constructor(private readonly profiles: ProfileRepositoryPort) {}

  async execute(userId: string): Promise<ProfileView> {
    const profile = await this.profiles.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil no encontrado.');
    }
    return profile;
  }
}
