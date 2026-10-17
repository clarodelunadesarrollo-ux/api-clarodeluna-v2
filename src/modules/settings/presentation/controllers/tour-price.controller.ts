import {
    Body,
    Controller,
    Get,
    Inject,
    Patch,
    UseGuards,
} from '@nestjs/common';

import { RolesGuard } from '../../../../common/auth/roles.guard';
import { UserRole } from '../../../../common/auth/user-role.enum';
import { Public } from '../../../../common/decorators/public.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
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

  // Protected by the global JwtAuthGuard AND restricted to ADMIN via RolesGuard.
  // The admin app consumes this endpoint to edit the informative tour price.
  @Patch()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Body() dto: UpdateTourPriceDto): Promise<TourPriceResponseDto> {
    const result = await this.updateTourPrice.execute(dto.priceCents);
    return new TourPriceResponseDto(result);
  }
}
