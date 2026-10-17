import { TourPriceSettingResult } from '../../results/tour-price-setting.result';

export const GET_TOUR_PRICE_SETTING_USE_CASE = Symbol(
  'GET_TOUR_PRICE_SETTING_USE_CASE',
);

export interface GetTourPriceSettingUseCasePort {
  execute(): Promise<TourPriceSettingResult>;
}
