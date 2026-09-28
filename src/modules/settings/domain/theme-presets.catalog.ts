import { DEFAULT_SEMANTIC_COLORS, ThemePreset } from './theme-configuration';

/**
 * The curated catalog of theme presets. This is the single source of truth for
 * the seed (which persists them into the ThemePreset table) and the runtime
 * fallback. Each preset defines the 10 semantic tokens (light + dark) plus the
 * shared semantic status colors. User-facing names/descriptions are in Spanish;
 * keys and code stay in English/snake_case.
 */
export const THEME_PRESETS_CATALOG: ThemePreset[] = [
  {
    key: 'tierra_botanica',
    name: 'Tierra Botánica',
    description: 'Elegante, orgánica y fiel a la identidad de la imagen.',
    suggestedUse:
      'Navegación, botones principales, reservas y pantallas de bienvenida.',
    sortOrder: 1,
    isDefault: true,
    palette: {
      background: { light: '#F7F3E8', dark: '#101A12' },
      surface: { light: '#EEE8D8', dark: '#1B2A1C' },
      card: { light: '#FFFCF4', dark: '#243625' },
      primary: { light: '#1E5128', dark: '#8FBA76' },
      primaryHover: { light: '#163E1E', dark: '#B1D398' },
      secondary: { light: '#AABF91', dark: '#607B62' },
      accent: { light: '#B46F45', dark: '#D79B71' },
      textPrimary: { light: '#172018', dark: '#F4F1E7' },
      textSecondary: { light: '#526052', dark: '#C0CABC' },
      border: { light: '#D8D3C2', dark: '#3D503E' },
    },
    semantic: DEFAULT_SEMANTIC_COLORS,
  },
  {
    key: 'luna_y_olivo',
    name: 'Luna y Olivo',
    description:
      'Más suave y sofisticada; ideal para una experiencia nocturna, reservas o eventos especiales.',
    suggestedUse:
      'Menú gourmet, storytelling de ingredientes y estados destacados.',
    sortOrder: 2,
    isDefault: false,
    palette: {
      background: { light: '#F5F2E9', dark: '#151914' },
      surface: { light: '#E7E2D2', dark: '#252B22' },
      card: { light: '#FFFDF7', dark: '#30392C' },
      primary: { light: '#3B5635', dark: '#A8C590' },
      primaryHover: { light: '#293E25', dark: '#C8DDB9' },
      secondary: { light: '#899B72', dark: '#738A67' },
      accent: { light: '#B98C4E', dark: '#E0B970' },
      textPrimary: { light: '#242A20', dark: '#F5F3EA' },
      textSecondary: { light: '#666F5B', dark: '#C3CCBB' },
      border: { light: '#D4D0BF', dark: '#465144' },
    },
    semantic: DEFAULT_SEMANTIC_COLORS,
  },
  {
    key: 'huerta_viva',
    name: 'Huerta Viva',
    description:
      'Una propuesta más fresca, luminosa y accesible, sin perder sofisticación.',
    suggestedUse:
      'Mapa de la huerta, talleres, experiencias interactivas y sostenibilidad.',
    sortOrder: 3,
    isDefault: false,
    palette: {
      background: { light: '#F6F8EF', dark: '#102019' },
      surface: { light: '#E3ECD9', dark: '#193326' },
      card: { light: '#FFFFFF', dark: '#22432F' },
      primary: { light: '#27643B', dark: '#74C58A' },
      primaryHover: { light: '#1B4E2D', dark: '#9ADDAB' },
      secondary: { light: '#91B77B', dark: '#5D976C' },
      accent: { light: '#D9A441', dark: '#F0C668' },
      textPrimary: { light: '#173222', dark: '#F1F8F0' },
      textSecondary: { light: '#55705E', dark: '#BED8C2' },
      border: { light: '#CAD9C5', dark: '#365D44' },
    },
    semantic: DEFAULT_SEMANTIC_COLORS,
  },
  {
    key: 'arcilla_y_bosque',
    name: 'Arcilla y Bosque',
    description:
      'Más cálida y gastronómica. Excelente para comunicar platos, temporada y cercanía humana.',
    suggestedUse:
      'Cartas de platos, llamados de reserva, promociones y fotos de cocina.',
    sortOrder: 4,
    isDefault: false,
    palette: {
      background: { light: '#FAF3EA', dark: '#1C1712' },
      surface: { light: '#F0E1D1', dark: '#30241C' },
      card: { light: '#FFF9F3', dark: '#3B2E23' },
      primary: { light: '#36533A', dark: '#9BBC8B' },
      primaryHover: { light: '#253D2A', dark: '#C2DBB3' },
      secondary: { light: '#B96D4B', dark: '#D99270' },
      accent: { light: '#C9943F', dark: '#E4B661' },
      textPrimary: { light: '#2C251E', dark: '#FFF5EB' },
      textSecondary: { light: '#6B5B4C', dark: '#D9C8B9' },
      border: { light: '#E1CFC0', dark: '#5A4637' },
    },
    semantic: DEFAULT_SEMANTIC_COLORS,
  },
  {
    key: 'niebla_de_montana',
    name: 'Niebla de Montaña',
    description:
      'Inspirada en el paisaje montañoso de la imagen; más editorial, serena y contemporánea.',
    suggestedUse:
      'Onboarding, recorridos, mapas, contenido de origen y narrativa de marca.',
    sortOrder: 5,
    isDefault: false,
    palette: {
      background: { light: '#F1F3ED', dark: '#121B1B' },
      surface: { light: '#DEE5DC', dark: '#1D2A29' },
      card: { light: '#FAFCF8', dark: '#293A37' },
      primary: { light: '#244B43', dark: '#85B9A6' },
      primaryHover: { light: '#183831', dark: '#ABD4C3' },
      secondary: { light: '#8DA79A', dark: '#66887D' },
      accent: { light: '#7395A0', dark: '#9AC2CC' },
      textPrimary: { light: '#1B2925', dark: '#F1F7F3' },
      textSecondary: { light: '#586A64', dark: '#BED0C9' },
      border: { light: '#CDD8D1', dark: '#3D5650' },
    },
    semantic: DEFAULT_SEMANTIC_COLORS,
  },
];

// The default preset resolved from the catalog (Tierra Botánica).
export const DEFAULT_THEME_PRESET: ThemePreset =
  THEME_PRESETS_CATALOG.find((preset) => preset.isDefault) ??
  THEME_PRESETS_CATALOG[0];
