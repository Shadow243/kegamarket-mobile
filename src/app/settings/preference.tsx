import { useLocalSearchParams } from 'expo-router';

import { PreferencePicker, type PreferenceType } from '@/screens/account/preferences';

export default function PreferenceRoute() {
  const { type } = useLocalSearchParams<{ type: PreferenceType }>();
  return <PreferencePicker type={type ?? 'language'} />;
}
