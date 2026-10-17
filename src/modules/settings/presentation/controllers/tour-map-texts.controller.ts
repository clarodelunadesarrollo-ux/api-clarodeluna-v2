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
    GET_TOUR_MAP_TEXTS_SETTING_USE_CASE,
    GetTourMapTextsSettingUseCasePort,
} from '../../application/ports/in/get-tour-map-texts-setting.port';
import {
    UPDATE_TOUR_MAP_TEXTS_SETTING_USE_CASE,
    UpdateTourMapTextsSettingUseCasePort,
} from '../../application/ports/in/update-tour-map-texts-setting.port';
import { TourMapTextsResponseDto } from '../dtos/tour-map-texts-response.dto';
import { UpdateTourMapTextsDto } from '../dtos/update-tour-map-texts.dto';

@Controller('settings/tour-map-texts')
export class TourMapTextsController {
  constructor(
    @Inject(GET_TOUR_MAP_TEXTS_SETTING_USE_CASE)
    private readonly getTourMapTexts: GetTourMapTextsSettingUseCasePort,
    @Inject(UPDATE_TOUR_MAP_TEXTS_SETTING_USE_CASE)
    private readonly updateTourMapTexts: UpdateTourMapTextsSettingUseCasePort,
  ) {}

  // Public: the client app renders the map interface texts without auth.
  @Public()
  @Get()
  async get(): Promise<TourMapTextsResponseDto> {
    const result = await this.getTourMapTexts.execute();
    return new TourMapTextsResponseDto(result);
  }

  // Protected by the global JwtAuthGuard AND restricted to ADMIN via RolesGuard.
  @Patch()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Body() dto: UpdateTourMapTextsDto,
  ): Promise<TourMapTextsResponseDto> {
    const result = await this.updateTourMapTexts.execute({ ...dto });
    return new TourMapTextsResponseDto(result);
  }
}
