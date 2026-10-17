import { Body, Controller, Get, Inject, Patch } from '@nestjs/common';

import { Public } from '../../../../common/decorators/public.decorator';
import {
    GET_TOUR_PRICE_SETTING_USE_CASE,
    GetTourPriceSettingUseCasePort,
} from '../../application/ports/in/get-tour-price-setting.port';
import {
    UPDATE_TOUR_PRICE_SETTING_USE_CASE,
    UpdateTourPriceSettingUseCasePort,
} from '../../application/ports/in/update-tour-price-setting.port';
import { TourPriceResponseDto } from '../dtos/tour-price-response.dto';
import { UpdateTourPriceDto } from '../dtos/update-tour-price.dto';

@Controller('settings/tour-price')
export class TourPriceController {
  constructor(
    @Inject(GET_TOUR_PRICE_SETTING_USE_CASE)
    private readonly getTourPrice: GetTourPriceSettingUseCasePort,
    @Inject(UPDATE_TOUR_PRICE_SETTING_USE_CASE)
    private readonly updateTourPrice: UpdateTourPriceSettingUseCasePort,
  ) {}

  // Public: the client app shows the informative tour price without requiring
  // the user to be authenticated.
  @Public()
  @Get()
  async get(): Promise<TourPriceResponseDto> {
    const result = await this.getTourPrice.execute();
    return new TourPriceResponseDto(result);
  }

  // Protected by the global JWT guard. Admin-role authorization is future work;
  // the dedicated admin app will consume this endpoint with its own auth.
  @Patch()
  async update(@Body() dto: UpdateTourPriceDto): Promise<TourPriceResponseDto> {
    const result = await this.updateTourPrice.execute(dto.priceCents);
    return new TourPriceResponseDto(result);
  }
}
