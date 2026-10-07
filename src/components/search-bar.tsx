import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';

import { Text } from './text';

interface SearchBarProps extends Pick<TextInputProps, 'value' | 'onChangeText' | 'autoFocus'> {
  placeholder: string;
  /** Without onChangeText the bar is a button that opens the search screen. */
  onPress?: () => void;
  onFilterPress?: () => void;
  filterCount?: number;
}

export function SearchBar({
  placeholder,
  value,
  onChangeText,
  autoFocus,
  onPress,
  onFilterPress,
  filterCount = 0,
}: SearchBarProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isInput = onChangeText !== undefined;

  const field = (
    <View
      className="h-[52px] flex-1 flex-row items-center gap-3 rounded-2xl bg-surface-muted pl-4 pr-3"
      style={{ borderCurve: 'continuous' }}
    >
      <Search size={20} color={colors['fg-muted']} strokeWidth={2} />
      {isInput ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          autoFocus={autoFocus}
          placeholder={placeholder}
          placeholderTextColor={colors['fg-subtle']}
          selectionColor={colors.brand}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel={placeholder}
          className="h-full flex-1 font-body text-[15px] text-fg"
        />
      ) : (
        <Text tone="subtle" className="flex-1 text-[15px]" numberOfLines={1}>
          {placeholder}
        </Text>
      )}
      {isInput && value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('search.clear')}
          hitSlop={10}
          onPress={() => onChangeText?.('')}
        >
          <X size={18} color={colors['fg-muted']} />
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <View className="flex-row items-center gap-2.5">
      {isInput ? (
        field
      ) : (
        <Pressable
          accessibilityRole="search"
          onPress={onPress}
          className="flex-1 active:opacity-80"
        >
          {field}
        </Pressable>
      )}
      {onFilterPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('search.filters')}
          onPress={onFilterPress}
          className="h-[52px] w-[52px] items-center justify-center rounded-2xl bg-action active:opacity-80"
          style={{ borderCurve: 'continuous' }}
        >
          <SlidersHorizontal size={20} color={colors['on-action']} strokeWidth={2} />
          {filterCount > 0 ? (
            <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-accent-400" />
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}
