import type { Config } from 'tailwindcss';

import { night, palette, semantic } from './src/theme/palette';

const semanticColors = Object.fromEntries(
  Object.keys(semantic.light).map((name) => [name, `var(--color-${name})`]),
);

export default {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: palette.primary,
        accent: palette.accent,
        ink: palette.ink,
        danger: palette.danger,
        success: palette.success,
        warning: palette.warning,
        night,
        ...semanticColors,
      },
      fontFamily: {
        heading: ['BricolageGrotesque_700Bold'],
        'heading-semibold': ['BricolageGrotesque_600SemiBold'],
        'heading-extrabold': ['BricolageGrotesque_800ExtraBold'],
        body: ['Manrope_500Medium'],
        'body-regular': ['Manrope_400Regular'],
        'body-semibold': ['Manrope_600SemiBold'],
        'body-bold': ['Manrope_700Bold'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
