import { BadRequestException } from '@nestjs/common';

import {
    TOUR_MAP_TEXTS_KEY,
    TOUR_MAP_TEXT_FIELDS,
    TourMapTexts,
    hasOrderToken,
    parseTourMapTexts,
    serializeTourMapTexts,
} from '../../domain/tour-map-texts';
import { UpdateTourMapTextsSettingUseCasePort } from '../ports/in/update-tour-map-texts-setting.port';
import { AppSettingRepositoryPort } from '../ports/out/app-setting-repository.port';
import { TourMapTextsResult } from '../results/tour-map-texts-setting.result';

export class UpdateTourMapTextsSettingUseCase
  implements UpdateTourMapTextsSettingUseCasePort
{
  constructor(private readonly settings: AppSettingRepositoryPort) {}

  async execute(patch: Partial<TourMapTextsResult>): Promise<TourMapTextsResult> {
    const current = await this.settings.findByKey(TOUR_MAP_TEXTS_KEY);
    const merged: TourMapTexts = parseTourMapTexts(current?.value ?? null);

    for (const field of TOUR_MAP_TEXT_FIELDS) {
      const value = patch[field];
      if (typeof value === 'string' && value.length > 0) {
        merged[field] = value;
      }
    }

    if (!hasOrderToken(merged.stepLabel)) {
      throw new BadRequestException(
        'stepLabel debe incluir el literal "{order}".',
      );
    }

    const setting = await this.settings.upsert(
      TOUR_MAP_TEXTS_KEY,
      serializeTourMapTexts(merged),
    );
    return parseTourMapTexts(setting.value);
  }
}
