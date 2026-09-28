import { Controller, Get, Inject } from '@nestjs/common';

import {
    LIST_ACTIVE_PROMOS_USE_CASE,
    ListActivePromosUseCasePort,
} from '../../application/ports/in/list-active-promos.port';
import { PromoResponseDto } from '../dtos/promo-response.dto';

// Guest surface for promo cards. Protected by the global JwtAuthGuard. Returns
// only the active cards ordered by `order` asc; the Home carousel renders them
// alongside the reservation card.
@Controller('promos')
export class PromosController {
  constructor(
    @Inject(LIST_ACTIVE_PROMOS_USE_CASE)
    private readonly listActivePromos: ListActivePromosUseCasePort,
  ) {}

  @Get()
  async list(): Promise<PromoResponseDto> {
    const promos = await this.listActivePromos.execute();
    return new PromoResponseDto(promos);
  }
}
