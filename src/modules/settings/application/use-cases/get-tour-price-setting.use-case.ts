import {
    TOUR_PRICE_CENTS_DEFAULT,
    TOUR_PRICE_CENTS_KEY,
    parseIntSetting,
} from '../../domain/tour-pricing';
import { GetTourPriceSettingUseCasePort } from '../ports/in/get-tour-price-setting.port';
import { AppSettingRepositoryPort } from '../ports/out/app-setting-repository.port';
import { TourPriceSettingResult } from '../results/tour-price-setting.result';

export class GetTourPriceSettingUseCase
  implements GetTourPriceSettingUseCasePort
{
  constructor(private readonly settings: AppSettingRepositoryPort) {}

  async execute(): Promise<TourPriceSettingResult> {
    const setting = await this.settings.findByKey(TOUR_PRICE_CENTS_KEY);
    const priceCents = parseIntSetting(
      setting?.value ?? null,
      TOUR_PRICE_CENTS_DEFAULT,
    );
    return { priceCents };
  }
}
