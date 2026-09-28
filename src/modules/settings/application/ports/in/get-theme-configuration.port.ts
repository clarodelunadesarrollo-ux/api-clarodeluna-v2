import { ThemeConfigurationResult } from '../../results/theme-configuration.result';

export const GET_THEME_CONFIGURATION_USE_CASE = Symbol(
  'GET_THEME_CONFIGURATION_USE_CASE',
);

export interface GetThemeConfigurationUseCasePort {
  execute(): Promise<ThemeConfigurationResult>;
}
