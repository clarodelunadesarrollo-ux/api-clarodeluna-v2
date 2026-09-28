import { Prisma, PrismaClient } from '@prisma/client';

import {
    ADMIN_USER_EMAIL,
    ADMIN_USER_NAME,
} from '../src/modules/auth/domain/admin-user';
import { DEFAULT_PRESET_KEY } from '../src/modules/settings/domain/theme-configuration';
import { THEME_PRESETS_CATALOG } from '../src/modules/settings/domain/theme-presets.catalog';

const prisma = new PrismaClient();

// Default schedules seeded once per reservation type. Available times are
// generated as open, open+interval, ... strictly before close. The admin panel
// is the source of truth afterwards, so the seed only inserts missing types and
// never overwrites an existing configuration.
async function seedReservationSchedules(): Promise<void> {
  const defaults = [
    {
      type: 'TOUR' as const,
      openTime: '10:00',
      closeTime: '18:00',
      intervalMinutes: 120,
    },
    {
      type: 'RESTAURANT' as const,
      openTime: '12:00',
      closeTime: '23:00',
      intervalMinutes: 30,
    },
  ];

  for (const schedule of defaults) {
    const existing = await prisma.reservationSchedule.findUnique({
      where: { type: schedule.type },
    });
    if (existing === null) {
      await prisma.reservationSchedule.create({
        data: { ...schedule, active: true },
      });
    }
  }
}

// Keep in sync with OTP_LOCAL_NOTIFICATION_ENABLED_KEY in
// src/modules/settings/domain/notification-channel.ts
const OTP_LOCAL_NOTIFICATION_ENABLED_KEY = 'otp.local_notification_enabled';

async function seedAppSettings(): Promise<void> {
  const existing = await prisma.appSetting.findUnique({
    where: { key: OTP_LOCAL_NOTIFICATION_ENABLED_KEY },
  });
  if (existing === null) {
    await prisma.appSetting.create({
      data: { key: OTP_LOCAL_NOTIFICATION_ENABLED_KEY, value: 'true' },
    });
  }
}

interface TourStopSeed {
  order: number;
  title: string;
  description: string;
  positionX: number;
  positionY: number;
}

// Initial bootstrap for the single global tour itinerary shown on the map after
// check-in. Positions are relative coordinates (0.0-1.0) over
// assets/map/map.jpeg. The seed only inserts stops that are missing, so once
// they exist the database is the source of truth: adjust positions and copy
// directly in the DB and re-running the seed will never overwrite them.
const TOUR_STOPS: readonly TourStopSeed[] = [
  {
    order: 1,
    title: 'Llegada y recepción',
    description:
      'Te recibimos en la entrada principal con una bebida de bienvenida.',
    positionX: 0.52,
    positionY: 0.78,
  },
  {
    order: 2,
    title: 'Huerta',
    description: 'Recorrido por la huerta orgánica y cosecha del día.',
    positionX: 0.24,
    positionY: 0.61,
  },
  {
    order: 3,
    title: 'Compostaje',
    description:
      'Conocé cómo transformamos los restos orgánicos en abono para la huerta.',
    positionX: 0.41,
    positionY: 0.66,
  },
  {
    order: 4,
    title: 'Taller',
    description: 'Taller de cocina de raíz con productos de estación.',
    positionX: 0.74,
    positionY: 0.65,
  },
  {
    order: 5,
    title: 'Restaurante',
    description: 'Almuerzo en el salón principal.',
    positionX: 0.55,
    positionY: 0.45,
  },
  {
    order: 6,
    title: 'Cierre',
    description: 'Cierre de la experiencia.',
    positionX: 0.44,
    positionY: 0.34,
  },
];

async function seedTourStops(): Promise<void> {
  for (const stop of TOUR_STOPS) {
    const existing = await prisma.tourStop.findFirst({
      where: { order: stop.order },
    });
    if (existing === null) {
      await prisma.tourStop.create({
        data: { ...stop, active: true },
      });
    }
  }
}

// Sample Cloudinary URL used to validate the menu UI end to end. The admin app
// will replace these with real dish photos.
const SAMPLE_DISH_IMAGE_URL =
  'https://res.cloudinary.com/yjz6pfeh/image/upload/v1790466563/cld-sample-4.jpg';

interface MenuDishSeed {
  name: string;
  description: string;
  priceCents: number | null;
  tags: string[];
  order: number;
}

interface MenuSectionSeed {
  menuType: 'TOUR' | 'RESTAURANT';
  title: string;
  order: number;
  dishes: MenuDishSeed[];
}

// TOUR menu has no prices (included in the experience); RESTAURANT menu is the
// à la carte offering with prices. Diet tags are optional.
const MENU_SECTIONS: readonly MenuSectionSeed[] = [
  {
    menuType: 'TOUR',
    title: 'Menú del día',
    order: 1,
    dishes: [
      {
        name: 'Entrada de huerta',
        description: 'Hojas verdes de nuestra huerta con aderezo de la casa.',
        priceCents: null,
        tags: ['Vegetariano'],
        order: 1,
      },
      {
        name: 'Principal de estación',
        description: 'Plato principal elaborado con productos de estación.',
        priceCents: null,
        tags: [],
        order: 2,
      },
      {
        name: 'Postre casero',
        description: 'Postre del día preparado en nuestra cocina.',
        priceCents: null,
        tags: [],
        order: 3,
      },
    ],
  },
  {
    menuType: 'RESTAURANT',
    title: 'Entradas',
    order: 1,
    dishes: [
      {
        name: 'Provoleta a la parrilla',
        description: 'Queso provolone grillado con orégano y aceite de oliva.',
        priceCents: 650000,
        tags: ['Vegetariano'],
        order: 1,
      },
      {
        name: 'Empanadas criollas',
        description: 'Empanadas de carne cortada a cuchillo.',
        priceCents: 480000,
        tags: [],
        order: 2,
      },
    ],
  },
  {
    menuType: 'RESTAURANT',
    title: 'Principales',
    order: 2,
    dishes: [
      {
        name: 'Bife de chorizo',
        description: 'Corte premium a la parrilla con guarnición.',
        priceCents: 1450000,
        tags: [],
        order: 1,
      },
      {
        name: 'Risotto de hongos',
        description: 'Arroz cremoso con hongos de estación.',
        priceCents: 1180000,
        tags: ['Vegetariano', 'Sin TACC'],
        order: 2,
      },
    ],
  },
  {
    menuType: 'RESTAURANT',
    title: 'Postres',
    order: 3,
    dishes: [
      {
        name: 'Flan casero',
        description: 'Flan con dulce de leche y crema.',
        priceCents: 520000,
        tags: ['Vegetariano'],
        order: 1,
      },
    ],
  },
  {
    menuType: 'RESTAURANT',
    title: 'Bebidas',
    order: 4,
    dishes: [
      {
        name: 'Limonada de la casa',
        description: 'Limonada natural con menta y jengibre.',
        priceCents: 350000,
        tags: ['Vegano', 'Sin TACC'],
        order: 1,
      },
    ],
  },
];

async function seedMenu(): Promise<void> {
  for (const section of MENU_SECTIONS) {
    let existingSection = await prisma.menuSection.findFirst({
      where: { menuType: section.menuType, title: section.title },
    });
    if (existingSection === null) {
      existingSection = await prisma.menuSection.create({
        data: {
          menuType: section.menuType,
          title: section.title,
          order: section.order,
          active: true,
        },
      });
    }

    for (const dish of section.dishes) {
      const existingDish = await prisma.menuDish.findFirst({
        where: { sectionId: existingSection.id, name: dish.name },
      });
      if (existingDish === null) {
        await prisma.menuDish.create({
          data: {
            sectionId: existingSection.id,
            name: dish.name,
            description: dish.description,
            imageUrl: SAMPLE_DISH_IMAGE_URL,
            priceCents: dish.priceCents,
            tags: dish.tags,
            order: dish.order,
            active: true,
          },
        });
      }
    }
  }
}

// Sample Cloudinary media used to validate the huerta UI end to end. The admin
// app will replace these with real content. The VIDEO item exercises smooth
// playback plus a guaranteed poster.
const SAMPLE_HUERTA_IMAGE_URL =
  'https://res.cloudinary.com/yjz6pfeh/image/upload/v1790466563/cld-sample-4.jpg';
const SAMPLE_HUERTA_VIDEO_URL =
  'https://res.cloudinary.com/yjz6pfeh/video/upload/w_1280,c_limit,q_auto/v1790466554/samples/cld-sample-video.mp4';
const SAMPLE_HUERTA_POSTER_URL =
  'https://res.cloudinary.com/yjz6pfeh/image/upload/v1790466563/cld-sample-4.jpg';

interface HuertaItemSeed {
  type: 'IMAGE' | 'VIDEO';
  title: string;
  description: string | null;
  mediaUrl: string;
  posterUrl: string | null;
  order: number;
}

const HUERTA_ITEMS: readonly HuertaItemSeed[] = [
  {
    type: 'IMAGE',
    title: 'Nuestra huerta orgánica',
    description: 'De la tierra a la mesa: así cultivamos lo que vas a comer.',
    mediaUrl: SAMPLE_HUERTA_IMAGE_URL,
    posterUrl: null,
    order: 1,
  },
  {
    type: 'VIDEO',
    title: 'Sistema de riego inteligente',
    description: 'Riego por goteo automatizado que cuida cada gota de agua.',
    mediaUrl: SAMPLE_HUERTA_VIDEO_URL,
    posterUrl: SAMPLE_HUERTA_POSTER_URL,
    order: 2,
  },
];

async function seedHuerta(): Promise<void> {
  for (const item of HUERTA_ITEMS) {
    const existing = await prisma.huertaItem.findFirst({
      where: { title: item.title },
    });
    if (existing === null) {
      await prisma.huertaItem.create({
        data: {
          type: item.type,
          title: item.title,
          description: item.description,
          mediaUrl: item.mediaUrl,
          posterUrl: item.posterUrl,
          order: item.order,
          active: true,
        },
      });
    }
  }
}

// Promo cards shown in the Home carousel next to the reservation card. Seeded
// only when missing, so the admin stays the source of truth once configured.
// `icon` keys match the guest app's promo icon catalog (with a safe fallback).
interface PromoCardSeed {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  icon: string | null;
  order: number;
}

const PROMO_CARDS: readonly PromoCardSeed[] = [
  {
    title: 'Noche de cosecha',
    subtitle: 'Menú de autor con productos de nuestra huerta.',
    imageUrl: null,
    icon: 'restaurant',
    order: 1,
  },
  {
    title: 'Maridaje de temporada',
    subtitle: 'Vinos seleccionados para acompañar cada plato.',
    imageUrl: null,
    icon: 'wine_bar',
    order: 2,
  },
];

async function seedPromos(): Promise<void> {
  for (const promo of PROMO_CARDS) {
    const existing = await prisma.promoCard.findFirst({
      where: { title: promo.title },
    });
    if (existing === null) {
      await prisma.promoCard.create({
        data: {
          title: promo.title,
          subtitle: promo.subtitle,
          imageUrl: promo.imageUrl,
          icon: promo.icon,
          order: promo.order,
          active: true,
        },
      });
    }
  }
}


// Bootstrap for the singleton VR experience. The admin edits title/videoUrl from
// the API; the seed only inserts it when missing, so the DB stays the source of
// truth once configured.
const VR_EXPERIENCE_TITLE = 'Recorrido inmersivo Claro de Luna';
const VR_EXPERIENCE_VIDEO_URL =
  'https://res.cloudinary.com/yjz6pfeh/video/upload/v1790544724/video.mp4';

async function seedVrExperience(): Promise<void> {
  const existing = await prisma.vrExperience.findFirst();
  if (existing === null) {
    await prisma.vrExperience.create({
      data: {
        title: VR_EXPERIENCE_TITLE,
        videoUrl: VR_EXPERIENCE_VIDEO_URL,
      },
    });
  }
}

// Default global theme configuration, equivalent to the app's current look:
// Playfair Display titles, Inter subtitles/body, "default" palette, and
// system-driven light/dark. Keep in sync with DEFAULT_THEME_CONFIGURATION in
// src/modules/settings/domain/theme-configuration.ts. Only inserted when
// missing, so the database stays the source of truth once it exists.
const THEME_CONFIGURATION_ID = 'singleton';

// Seeds the theme preset catalog (the curated palettes). Bootstrap-only: the DB
// is the source of truth once seeded, so each preset is created only when its
// key is missing and existing rows are never overwritten. This preserves admin
// edits made from the panel across re-seeds.
async function seedThemePresets(): Promise<void> {
  for (const preset of THEME_PRESETS_CATALOG) {
    const existing = await prisma.themePreset.findUnique({
      where: { key: preset.key },
    });
    if (existing === null) {
      await prisma.themePreset.create({
        data: {
          key: preset.key,
          name: preset.name,
          description: preset.description,
          suggestedUse: preset.suggestedUse,
          sortOrder: preset.sortOrder,
          isDefault: preset.isDefault,
          palette: preset.palette as unknown as Prisma.InputJsonValue,
          semantic: preset.semantic as unknown as Prisma.InputJsonValue,
        },
      });
    }
  }
}

async function seedThemeConfiguration(): Promise<void> {
  const existing = await prisma.themeConfiguration.findUnique({
    where: { id: THEME_CONFIGURATION_ID },
  });
  if (existing === null) {
    await prisma.themeConfiguration.create({
      data: {
        id: THEME_CONFIGURATION_ID,
        mode: 'SYSTEM',
        titleFontFamily: 'Playfair Display',
        titleFontWeight: 600,
        subtitleFontFamily: 'Inter',
        subtitleFontWeight: 600,
        bodyFontFamily: 'Inter',
        bodyFontWeight: 400,
        paletteSource: 'PRESET',
        presetKey: DEFAULT_PRESET_KEY,
      },
    });
    return;
  }

  // Migrate legacy configs pointing at a preset key that no longer exists in
  // the catalog to the new default preset.
  const validKeys = THEME_PRESETS_CATALOG.map((preset) => preset.key);
  if (
    existing.paletteSource === 'PRESET' &&
    (existing.presetKey === null || !validKeys.includes(existing.presetKey))
  ) {
    await prisma.themeConfiguration.update({
      where: { id: THEME_CONFIGURATION_ID },
      data: { presetKey: DEFAULT_PRESET_KEY },
    });
  }
}

// Idempotent bootstrap of the single administrator account used by the admin
// panel service session (Option B). Upserts by unique email, ensuring the
// ADMIN role and display name, so re-running the seed never duplicates it.
async function seedAdminUser(): Promise<void> {
  await prisma.user.upsert({
    where: { email: ADMIN_USER_EMAIL },
    create: {
      email: ADMIN_USER_EMAIL,
      name: ADMIN_USER_NAME,
      role: 'ADMIN',
    },
    update: {
      name: ADMIN_USER_NAME,
      role: 'ADMIN',
    },
  });
}

async function main(): Promise<void> {
  await seedReservationSchedules();
  await seedAppSettings();
  await seedTourStops();
  await seedMenu();
  await seedHuerta();
  await seedVrExperience();
  await seedPromos();
  await seedThemePresets();
  await seedThemeConfiguration();
  await seedAdminUser();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
