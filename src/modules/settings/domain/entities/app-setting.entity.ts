export interface AppSettingSnapshot {
  key: string;
  value: string;
  updatedAt: Date;
}

export class AppSetting {
  private constructor(
    private readonly _key: string,
    private readonly _value: string,
    private readonly _updatedAt: Date,
  ) {}

  static rehydrate(snapshot: AppSettingSnapshot): AppSetting {
    return new AppSetting(snapshot.key, snapshot.value, snapshot.updatedAt);
  }

  get key(): string {
    return this._key;
  }

  get value(): string {
    return this._value;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
