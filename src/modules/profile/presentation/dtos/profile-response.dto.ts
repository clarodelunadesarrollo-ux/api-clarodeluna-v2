import { ProfileView } from '../../application/ports/out/profile-repository.port';

export class ProfileResponseDto {
  readonly name: string | null;
  readonly email: string;

  constructor(view: ProfileView) {
    this.name = view.name;
    this.email = view.email;
  }
}
