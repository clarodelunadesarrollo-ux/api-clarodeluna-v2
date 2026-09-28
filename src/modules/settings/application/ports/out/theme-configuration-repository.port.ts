import { ThemeConfiguration } from '../../../domain/entities/theme-configuration.entity';
import { ThemeConfigurationData } from '../../../domain/theme-configuration';

export const THEME_CONFIGURATION_REPOSITORY = Symbol(
  'THEME_CONFIGURATION_REPOSITORY',
);

export interface ThemeConfigurationRepositoryPort {
  find(): Promise<ThemeConfiguration | null>;
  upsert(data: ThemeConfigurationData): Promise<ThemeConfiguration>;
}
