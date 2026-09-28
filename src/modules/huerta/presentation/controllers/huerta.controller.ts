import { Controller, Get, Inject } from '@nestjs/common';

import {
    AuthenticatedUser,
    CurrentUser,
} from '../../../../common/auth/current-user.decorator';
import {
    GET_HUERTA_USE_CASE,
    GetHuertaUseCasePort,
} from '../../application/ports/in/get-huerta.port';
import { HuertaResponseDto } from '../dtos/huerta-response.dto';

// Protected by the global JwtAuthGuard. The guest app consumes this after
// check-in; access is resolved server-side from the user's active reservation
// (AD-1). Returns 403 when there is no check-in today (AD-5).
@Controller('huerta')
export class HuertaController {
  constructor(
    @Inject(GET_HUERTA_USE_CASE)
    private readonly getHuerta: GetHuertaUseCasePort,
  ) {}

  @Get()
  async get(@CurrentUser() user: AuthenticatedUser): Promise<HuertaResponseDto> {
    const items = await this.getHuerta.execute(user.userId);
    return new HuertaResponseDto(items);
  }
}
