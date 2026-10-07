import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_CURRENCY, type AppLocale } from '@/lib/config';

export type ThemePreference = 'system' | 'light' | 'dark';

interface PreferencesState {
  locale: AppLocale | null;
  currency: string;
  theme: ThemePreference;
  country: string | null;
  setLocale: (locale: AppLocale) => void;
  setCurrency: (currency: string) => void;
  setTheme: (theme: ThemePreference) => void;
  setCountry: (country: string | null) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      locale: null,
      currency: DEFAULT_CURRENCY,
      theme: 'system',
      country: null,
      setLocale: (locale) => set({ locale }),
      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme }),
      setCountry: (country) => set({ country }),
    }),
    {
      name: 'kega-preferences',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ locale, currency, theme, country }) => ({ locale, currency, theme, country }),
    },
  ),
);
