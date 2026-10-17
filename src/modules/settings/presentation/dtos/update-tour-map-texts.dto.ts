import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

// All fields optional: the admin can patch any subset. stepLabel additionally
// MUST contain the literal "{order}" token, which the client replaces with the
// stop number.
export class UpdateTourMapTextsDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly subtitle?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly retry?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly backTooltip?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly refreshTooltip?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly close?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly emptyTitle?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly emptyMessage?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/\{order\}/, {
    message: 'stepLabel debe incluir el literal "{order}".',
  })
  readonly stepLabel?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly failureNetwork?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly failureSession?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly failureServer?: string;
}
