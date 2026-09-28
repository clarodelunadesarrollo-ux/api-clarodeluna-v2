import { IsNotEmpty, IsString } from 'class-validator';

export class AdminSessionDto {
  @IsString()
  @IsNotEmpty()
  readonly panelKey!: string;
}
