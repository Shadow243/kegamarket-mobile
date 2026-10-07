import type { LucideIcon } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { Chip } from '@/components/chip';
import { Text } from '@/components/text';
import { useThemeColors } from '@/hooks/use-theme';

export interface PreferenceOption<T extends string> {
  value: T;
  label: string;
}

export function PreferenceRow<T extends string>({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  value: T;
  options: PreferenceOption<T>[];
  onChange: (value: T) => void;
}) {
  const colors = useThemeColors();

  return (
    <View className="gap-3 py-4">
      <View className="flex-row items-center gap-3 px-4">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-muted">
          <Icon size={18} color={colors.fg} strokeWidth={2} />
        </View>
        <Text variant="callout">{label}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-4"
      >
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={option.value === value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
