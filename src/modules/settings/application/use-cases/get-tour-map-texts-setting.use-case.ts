import {
    TOUR_MAP_TEXTS_KEY,
    parseTourMapTexts,
} from '../../domain/tour-map-texts';
import { GetTourMapTextsSettingUseCasePort } from '../ports/in/get-tour-map-texts-setting.port';
import { AppSettingRepositoryPort } from '../ports/out/app-setting-repository.port';
import { TourMapTextsResult } from '../results/tour-map-texts-setting.result';

export class GetTourMapTextsSettingUseCase
  implements GetTourMapTextsSettingUseCasePort
{
  constructor(private readonly settings: AppSettingRepositoryPort) {}

  async execute(): Promise<TourMapTextsResult> {
    const setting = await this.settings.findByKey(TOUR_MAP_TEXTS_KEY);
    return parseTourMapTexts(setting?.value ?? null);
  }
}
