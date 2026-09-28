import { UpdateProfileUseCasePort } from '../ports/in/update-profile.port';
import {
    ProfileRepositoryPort,
    ProfileView,
} from '../ports/out/profile-repository.port';

export class UpdateProfileUseCase implements UpdateProfileUseCasePort {
  constructor(private readonly profiles: ProfileRepositoryPort) {}

  async execute(userId: string, name: string | null): Promise<ProfileView> {
    // Empty or whitespace-only names clear the stored value.
    const trimmed = name?.trim();
    const normalized = trimmed && trimmed.length > 0 ? trimmed : null;
    return this.profiles.updateName(userId, normalized);
  }
}
