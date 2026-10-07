// Kega brand palette, shared with the web client (lokole-client/app/assets/css/main.css).
// Single source of truth: tailwind.config.ts and runtime code (icons, native props) both read it.
export const palette = {
  primary: {
    50: '#eef1fc',
    100: '#dde3f8',
    200: '#bcc9f0',
    300: '#8fa3e6',
    400: '#5c78d6',
    500: '#3455c4',
    600: '#1a3dad',
    700: '#002b9c',
    800: '#002380',
    900: '#001d66',
    950: '#000f3d',
  },
  accent: {
    50: '#f6fbdd',
    100: '#e9f6b8',
    200: '#d5ed85',
    300: '#c0e454',
    400: '#a8dc14',
    500: '#96c412',
    600: '#82ab10',
    700: '#6b8f0d',
    800: '#56730a',
    900: '#445c08',
  },
  ink: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  danger: { 50: '#fef2f2', 500: '#ce1021', 600: '#b00e1c' },
  success: { 50: '#f0fdf4', 500: '#16a34a', 600: '#15803d' },
  warning: { 50: '#fffbeb', 500: '#d97706' },
  white: '#ffffff',
  black: '#000000',
} as const;

// Semantic roles that flip with the color scheme. Exposed to Tailwind as CSS variables (see theme/index.ts).
// Kega's signature dark: a deep brand navy instead of plain black for strong elements.
export const night = { 900: '#0b1442', 950: '#060b26' } as const;

export const semantic = {
  light: {
    canvas: palette.white,
    surface: palette.white,
    'surface-muted': '#f3f4f7',
    'surface-raised': palette.white,
    line: '#e8eaf0',
    'line-strong': '#d3d8e3',
    fg: night[900],
    'fg-muted': '#6b7186',
    'fg-subtle': '#9aa0b2',
    action: night[900],
    'on-action': palette.white,
    brand: palette.primary[700],
    'brand-soft': palette.primary[50],
    'on-brand': palette.white,
    'danger-fg': palette.danger[500],
    overlay: 'rgba(6, 11, 38, 0.45)',
  },
  dark: {
    canvas: '#05081a',
    surface: '#0c1130',
    'surface-muted': '#141a3a',
    'surface-raised': '#1a2147',
    line: '#1e2650',
    'line-strong': '#2c3566',
    fg: '#f4f6fb',
    'fg-muted': '#9ba3bd',
    'fg-subtle': '#6c7493',
    action: palette.white,
    'on-action': night[900],
    brand: palette.primary[300],
    'brand-soft': '#141d4a',
    'on-brand': night[950],
    'danger-fg': '#f87171',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
} as const;

export type ColorScheme = keyof typeof semantic;
export type SemanticColor = keyof (typeof semantic)['light'];
