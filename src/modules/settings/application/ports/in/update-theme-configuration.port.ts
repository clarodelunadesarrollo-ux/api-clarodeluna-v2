import { ThemeConfigurationData } from '../../../domain/theme-configuration';
import { ThemeConfigurationResult } from '../../results/theme-configuration.result';

export const UPDATE_THEME_CONFIGURATION_USE_CASE = Symbol(
  'UPDATE_THEME_CONFIGURATION_USE_CASE',
);

export interface UpdateThemeConfigurationUseCasePort {
  execute(data: ThemeConfigurationData): Promise<ThemeConfigurationResult>;
}
