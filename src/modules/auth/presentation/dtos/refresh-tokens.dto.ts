import { IsJWT } from 'class-validator';

export class RefreshTokensDto {
  @IsJWT()
  readonly refreshToken!: string;
}
