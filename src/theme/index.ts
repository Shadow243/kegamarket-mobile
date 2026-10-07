import { vars } from 'nativewind';

import { semantic, type ColorScheme } from './palette';

export { night, palette, semantic, type ColorScheme, type SemanticColor } from './palette';

function toCssVars(scheme: ColorScheme) {
  return vars(
    Object.fromEntries(
      Object.entries(semantic[scheme]).map(([name, value]) => [`--color-${name}`, value]),
    ),
  );
}

export const themeVars = { light: toCssVars('light'), dark: toCssVars('dark') } as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

export const motion = { fast: 150, base: 250, slow: 400 } as const;
