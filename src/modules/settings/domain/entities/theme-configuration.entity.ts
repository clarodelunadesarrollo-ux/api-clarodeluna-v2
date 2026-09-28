import { ThemeConfigurationSnapshot } from '../theme-configuration';

/**
 * The global theme configuration aggregate. Immutable; rehydrated from
 * persistence and exposed as a snapshot to the application layer.
 */
export class ThemeConfiguration {
  private constructor(private readonly snapshot: ThemeConfigurationSnapshot) {}

  static rehydrate(snapshot: ThemeConfigurationSnapshot): ThemeConfiguration {
    return new ThemeConfiguration(snapshot);
  }

  toSnapshot(): ThemeConfigurationSnapshot {
    return this.snapshot;
  }
}
