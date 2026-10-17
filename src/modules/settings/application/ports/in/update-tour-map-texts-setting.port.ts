import { TourMapTextsResult } from '../../results/tour-map-texts-setting.result';

export const UPDATE_TOUR_MAP_TEXTS_SETTING_USE_CASE = Symbol(
  'UPDATE_TOUR_MAP_TEXTS_SETTING_USE_CASE',
);

export interface UpdateTourMapTextsSettingUseCasePort {
  execute(patch: Partial<TourMapTextsResult>): Promise<TourMapTextsResult>;
}
