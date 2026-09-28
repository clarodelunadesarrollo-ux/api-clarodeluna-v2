import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
} from '@nestjs/common';

import {
    AuthenticatedUser,
    CurrentUser,
} from '../../../../common/auth/current-user.decorator';
import { ReservationResponseDto } from '../../../reservations/presentation/dtos/reservation-response.dto';
import {
    GET_CURRENT_CHECKIN_CODE_USE_CASE,
    GetCurrentCheckinCodeUseCasePort,
} from '../../application/ports/in/get-current-checkin-code.port';
import {
    VALIDATE_ARRIVAL_USE_CASE,
    ValidateArrivalUseCasePort,
} from '../../application/ports/in/validate-arrival.port';
import { CheckinCodeResponseDto } from '../dtos/checkin-code-response.dto';
import { ValidateArrivalDto } from '../dtos/validate-arrival.dto';

@Controller('checkin')
export class CheckinController {
  constructor(
    @Inject(GET_CURRENT_CHECKIN_CODE_USE_CASE)
    private readonly getCurrentCheckinCode: GetCurrentCheckinCodeUseCasePort,
    @Inject(VALIDATE_ARRIVAL_USE_CASE)
    private readonly validateArrival: ValidateArrivalUseCasePort,
  ) {}

  @Get('current-code')
  async currentCode(): Promise<CheckinCodeResponseDto> {
    const checkinCode = await this.getCurrentCheckinCode.execute();
    return new CheckinCodeResponseDto(checkinCode);
  }

  @Post('arrival')
  @HttpCode(HttpStatus.OK)
  async arrival(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ValidateArrivalDto,
  ): Promise<ReservationResponseDto> {
    const reservation = await this.validateArrival.execute({
      userId: user.userId,
      code: dto.code,
    });
    return new ReservationResponseDto(reservation);
  }
}
