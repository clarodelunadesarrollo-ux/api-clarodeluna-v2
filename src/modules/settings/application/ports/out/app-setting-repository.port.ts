import { AppSetting } from '../../../domain/entities/app-setting.entity';

export const APP_SETTING_REPOSITORY = Symbol('APP_SETTING_REPOSITORY');

export interface AppSettingRepositoryPort {
  findByKey(key: string): Promise<AppSetting | null>;
  upsert(key: string, value: string): Promise<AppSetting>;
}
