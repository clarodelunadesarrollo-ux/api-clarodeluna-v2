import { TourPriceSettingResult } from '../../results/tour-price-setting.result';

export const UPDATE_TOUR_PRICE_SETTING_USE_CASE = Symbol(
  'UPDATE_TOUR_PRICE_SETTING_USE_CASE',
);

export interface UpdateTourPriceSettingUseCasePort {
  execute(priceCents: number): Promise<TourPriceSettingResult>;
}
