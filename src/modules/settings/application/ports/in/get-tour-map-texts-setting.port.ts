import { TourMapTextsResult } from '../../results/tour-map-texts-setting.result';

export const GET_TOUR_MAP_TEXTS_SETTING_USE_CASE = Symbol(
  'GET_TOUR_MAP_TEXTS_SETTING_USE_CASE',
);

export interface GetTourMapTextsSettingUseCasePort {
  execute(): Promise<TourMapTextsResult>;
}
