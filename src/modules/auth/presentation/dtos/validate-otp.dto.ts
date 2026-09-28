import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ValidateOtpDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  readonly email!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]{6}$/, { message: 'otp must be exactly 6 numeric digits' })
  readonly otp!: string;
}
