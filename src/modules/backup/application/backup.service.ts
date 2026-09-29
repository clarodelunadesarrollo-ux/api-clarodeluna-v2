import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { InvalidBackupException } from '../domain/exceptions/invalid-backup.exception';

/// Current bundle schema version. Bump when the shape changes so imports can
/// detect incompatible files.
const BACKUP_VERSION = 1;

/// Content collections included in a backup, in the order they are exported.
/// Users, chat, OTP and client reservations are intentionally excluded; only
/// admin-authored content and reservation configuration travel between servers.
type BackupData = {
  themeConfiguration: Record<string, unknown> | null;
  themePresets: Record<string, unknown>[];
  tourStops: Record<string, unknown>[];
  menuSections: Record<string, unknown>[];
  menuDishes: Record<string, unknown>[];
  huertaItems: Record<string, unknown>[];
  vrExperiences: Record<string, unknown>[];
  promoCards: Record<string, unknown>[];
  appSettings: Record<string, unknown>[];
  reservationSchedules: Record<string, unknown>[];
  reservationBlackouts: Record<string, unknown>[];
};

export type BackupBundle = {
  version: number;
  exportedAt: string;
  data: BackupData;
};

export type ImportSummary = {
  themePresets: number;
  tourStops: number;
  menuSections: number;
  menuDishes: number;
  huertaItems: number;
  vrExperiences: number;
  promoCards: number;
  appSettings: number;
  reservationSchedules: number;
  reservationBlackouts: number;
  themeConfiguration: boolean;
};

/// Exports and restores all admin-authored content so an admin can migrate a
/// local database to a fresh server. Media stays as external Cloudinary URLs.
/// This is a cross-cutting bulk utility, so it talks to Prisma directly rather
/// than composing a port per table.
@Injectable()
export class BackupService {
  constructor(private readonly prisma: PrismaService) {}

  async export(): Promise<BackupBundle> {
    const [
      themeConfiguration,
      themePresets,
      tourStops,
      menuSections,
      menuDishes,
      huertaItems,
      vrExperiences,
      promoCards,
      appSettings,
      reservationSchedules,
      reservationBlackouts,
    ] = await Promise.all([
      this.prisma.themeConfiguration.findFirst(),
      this.prisma.themePreset.findMany({ orderBy: { sortOrder: 'asc' } }),
      this.prisma.tourStop.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.menuSection.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.menuDish.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.huertaItem.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.vrExperience.findMany({ orderBy: { updatedAt: 'asc' } }),
      this.prisma.promoCard.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.appSetting.findMany(),
      this.prisma.reservationSchedule.findMany(),
      this.prisma.reservationBlackout.findMany(),
    ]);

    return {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        themeConfiguration: themeConfiguration as Record<string, unknown> | null,
        themePresets: themePresets as unknown as Record<string, unknown>[],
        tourStops: tourStops as unknown as Record<string, unknown>[],
        menuSections: menuSections as unknown as Record<string, unknown>[],
        menuDishes: menuDishes as unknown as Record<string, unknown>[],
        huertaItems: huertaItems as unknown as Record<string, unknown>[],
        vrExperiences: vrExperiences as unknown as Record<string, unknown>[],
        promoCards: promoCards as unknown as Record<string, unknown>[],
        appSettings: appSettings as unknown as Record<string, unknown>[],
        reservationSchedules:
          reservationSchedules as unknown as Record<string, unknown>[],
        reservationBlackouts:
          reservationBlackouts as unknown as Record<string, unknown>[],
      },
    };
  }

  /// Replaces all included content with the bundle's, in a single transaction:
  /// children are cleared before parents, then rows are re-inserted preserving
  /// ids and createdAt. Client reservations and users are never touched.
  async import(raw: unknown): Promise<ImportSummary> {
    const data = this.parse(raw);

    return this.prisma.$transaction(
      async (tx) => {
        // Clear children before parents to satisfy foreign keys.
        await tx.menuDish.deleteMany();
        await tx.menuSection.deleteMany();
        await tx.huertaItem.deleteMany();
        await tx.vrExperience.deleteMany();
        await tx.promoCard.deleteMany();
        await tx.tourStop.deleteMany();
        await tx.themePreset.deleteMany();
        await tx.appSetting.deleteMany();
        await tx.reservationSchedule.deleteMany();
        await tx.reservationBlackout.deleteMany();

        const themePresets = await tx.themePreset.createMany({
          data: this.rows(data.themePresets) as Prisma.ThemePresetCreateManyInput[],
        });
        const menuSections = await tx.menuSection.createMany({
          data: this.rows(data.menuSections) as Prisma.MenuSectionCreateManyInput[],
        });
        const menuDishes = await tx.menuDish.createMany({
          data: this.rows(data.menuDishes) as Prisma.MenuDishCreateManyInput[],
        });
        const tourStops = await tx.tourStop.createMany({
          data: this.rows(data.tourStops) as Prisma.TourStopCreateManyInput[],
        });
        const huertaItems = await tx.huertaItem.createMany({
          data: this.rows(data.huertaItems) as Prisma.HuertaItemCreateManyInput[],
        });
        const vrExperiences = await tx.vrExperience.createMany({
          data: this.rows(data.vrExperiences) as Prisma.VrExperienceCreateManyInput[],
        });
        const promoCards = await tx.promoCard.createMany({
          data: this.rows(data.promoCards) as Prisma.PromoCardCreateManyInput[],
        });
        const appSettings = await tx.appSetting.createMany({
          data: this.rows(data.appSettings) as Prisma.AppSettingCreateManyInput[],
        });
        const reservationSchedules = await tx.reservationSchedule.createMany({
          data: this.rows(
            data.reservationSchedules,
          ) as Prisma.ReservationScheduleCreateManyInput[],
        });
        const reservationBlackouts = await tx.reservationBlackout.createMany({
          data: this.rows(
            data.reservationBlackouts,
          ) as Prisma.ReservationBlackoutCreateManyInput[],
        });

        let themeConfiguration = false;
        if (data.themeConfiguration) {
          const config = this.omitUpdatedAt(data.themeConfiguration);
          const id = (config.id as string | undefined) ?? 'singleton';
          await tx.themeConfiguration.upsert({
            where: { id },
            create: config as Prisma.ThemeConfigurationUncheckedCreateInput,
            update: config as Prisma.ThemeConfigurationUncheckedUpdateInput,
          });
          themeConfiguration = true;
        }

        return {
          themePresets: themePresets.count,
          menuSections: menuSections.count,
          menuDishes: menuDishes.count,
          tourStops: tourStops.count,
          huertaItems: huertaItems.count,
          vrExperiences: vrExperiences.count,
          promoCards: promoCards.count,
          appSettings: appSettings.count,
          reservationSchedules: reservationSchedules.count,
          reservationBlackouts: reservationBlackouts.count,
          themeConfiguration,
        };
      },
      { timeout: 30_000, maxWait: 10_000 },
    );
  }

  /// Validates and normalizes the raw uploaded body into a BackupData with every
  /// collection guaranteed to be an array.
  private parse(raw: unknown): BackupData {
    if (typeof raw !== 'object' || raw === null) {
      throw new InvalidBackupException(
        'root is not an object',
        'El archivo de respaldo no es válido.',
      );
    }

    const bundle = raw as Record<string, unknown>;
    const data = (bundle.data ?? bundle) as Record<string, unknown>;

    if (typeof data !== 'object' || data === null) {
      throw new InvalidBackupException(
        'missing data object',
        'El archivo de respaldo no tiene datos para importar.',
      );
    }

    const themeConfiguration = data.themeConfiguration;
    if (
      themeConfiguration != null &&
      (typeof themeConfiguration !== 'object' || Array.isArray(themeConfiguration))
    ) {
      throw new InvalidBackupException(
        'themeConfiguration is not an object',
        'La configuración de tema del respaldo no es válida.',
      );
    }

    return {
      themeConfiguration:
        (themeConfiguration as Record<string, unknown> | null) ?? null,
      themePresets: this.asArray(data.themePresets, 'themePresets'),
      tourStops: this.asArray(data.tourStops, 'tourStops'),
      menuSections: this.asArray(data.menuSections, 'menuSections'),
      menuDishes: this.asArray(data.menuDishes, 'menuDishes'),
      huertaItems: this.asArray(data.huertaItems, 'huertaItems'),
      vrExperiences: this.asArray(data.vrExperiences, 'vrExperiences'),
      promoCards: this.asArray(data.promoCards, 'promoCards'),
      appSettings: this.asArray(data.appSettings, 'appSettings'),
      reservationSchedules: this.asArray(
        data.reservationSchedules,
        'reservationSchedules',
      ),
      reservationBlackouts: this.asArray(
        data.reservationBlackouts,
        'reservationBlackouts',
      ),
    };
  }

  private asArray(value: unknown, field: string): Record<string, unknown>[] {
    if (value == null) return [];
    if (!Array.isArray(value)) {
      throw new InvalidBackupException(
        `${field} is not an array`,
        `El respaldo tiene un formato inválido en "${field}".`,
      );
    }
    return value as Record<string, unknown>[];
  }

  /// Prepares rows for createMany: drops the auto-managed `updatedAt` (Prisma
  /// sets it) while preserving ids, foreign keys, createdAt and JSON fields.
  private rows(items: Record<string, unknown>[]): Record<string, unknown>[] {
    return items.map((item) => this.omitUpdatedAt(item));
  }

  private omitUpdatedAt(item: Record<string, unknown>): Record<string, unknown> {
    const { updatedAt: _updatedAt, ...rest } = item;
    return rest;
  }
}
