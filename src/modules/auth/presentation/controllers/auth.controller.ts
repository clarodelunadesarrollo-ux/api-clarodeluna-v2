import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Logger,
    Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Public } from '../../../../common/decorators/public.decorator';
import {
    REFRESH_TOKENS_USE_CASE,
    RefreshTokensUseCasePort,
} from '../../application/ports/in/refresh-tokens.port';
import {
    REQUEST_OTP_USE_CASE,
    RequestOtpUseCasePort,
} from '../../application/ports/in/request-otp.port';
import {
    VALIDATE_OTP_USE_CASE,
    ValidateOtpUseCasePort,
} from '../../application/ports/in/validate-otp.port';
import { RefreshTokensDto } from '../dtos/refresh-tokens.dto';
import { RequestOtpResponseDto } from '../dtos/request-otp-response.dto';
import { RequestOtpDto } from '../dtos/request-otp.dto';
import { ValidateOtpResponseDto } from '../dtos/validate-otp-response.dto';
import { ValidateOtpDto } from '../dtos/validate-otp.dto';

@Controller('auth/otp')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject(REQUEST_OTP_USE_CASE)
    private readonly requestOtpUseCase: RequestOtpUseCasePort,
    @Inject(VALIDATE_OTP_USE_CASE)
    private readonly validateOtpUseCase: ValidateOtpUseCasePort,
    @Inject(REFRESH_TOKENS_USE_CASE)
    private readonly refreshTokensUseCase: RefreshTokensUseCasePort,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('request')
  @HttpCode(HttpStatus.OK)
  async request(@Body() dto: RequestOtpDto): Promise<RequestOtpResponseDto> {
    const result = await this.requestOtpUseCase.execute(dto.email);
    const expose =
      this.config.get<string>('EXPOSE_OTP_IN_RESPONSE', 'true') === 'true';

    if (expose) {
      this.logger.log(`OTP for ${dto.email}: ${result.otp} (dev-only exposure)`);
    }

    return new RequestOtpResponseDto({
      otp: expose ? result.otp : undefined,
      expiresAt: result.expiresAt.toISOString(),
      resendAvailableAt: result.resendAvailableAt.toISOString(),
    });
  }

  @Public()
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validate(@Body() dto: ValidateOtpDto): Promise<ValidateOtpResponseDto> {
    const tokens = await this.validateOtpUseCase.execute(dto.email, dto.otp);
    return new ValidateOtpResponseDto(tokens);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokensDto,
  ): Promise<ValidateOtpResponseDto> {
    const tokens = await this.refreshTokensUseCase.execute(dto.refreshToken);
    return new ValidateOtpResponseDto(tokens);
  }
}
