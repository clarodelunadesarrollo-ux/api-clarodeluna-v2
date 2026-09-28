import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateVrExperienceDto {
  @IsString()
  @IsNotEmpty()
  readonly title!: string;

  @IsUrl()
  readonly videoUrl!: string;
}
