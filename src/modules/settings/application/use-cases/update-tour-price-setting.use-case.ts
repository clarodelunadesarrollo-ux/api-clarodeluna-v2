import {
    TOUR_PRICE_CENTS_KEY,
    parseIntSetting,
    serializeIntSetting,
} from '../../domain/tour-pricing';
import { UpdateTourPriceSettingUseCasePort } from '../ports/in/update-tour-price-setting.port';
import { AppSettingRepositoryPort } from '../ports/out/app-setting-repository.port';
import { TourPriceSettingResult } from '../results/tour-price-setting.result';

export class UpdateTourPriceSettingUseCase
  implements UpdateTourPriceSettingUseCasePort
{
  constructor(private readonly settings: AppSettingRepositoryPort) {}

  async execute(priceCents: number): Promise<TourPriceSettingResult> {
    const setting = await this.settings.upsert(
      TOUR_PRICE_CENTS_KEY,
      serializeIntSetting(priceCents),
    );
    return {
      priceCents: parseIntSetting(setting.value, priceCents),
    };
  }
}
