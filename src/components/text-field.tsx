import { Eye, EyeOff } from 'lucide-react-native';
import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';

import { Text } from './text';

export interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, secureTextEntry, ...props },
  ref,
) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isSecret = secureTextEntry === true;

  return (
    <View className="gap-1.5">
      <Text variant="caption" className="text-fg">
        {label}
      </Text>
      <View
        className={cn(
          'h-14 flex-row items-center rounded-2xl border-[1.5px] bg-surface px-4',
          error ? 'border-danger-500' : focused ? 'border-brand' : 'border-line',
        )}
        style={{ borderCurve: 'continuous' }}
      >
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors['fg-subtle']}
          selectionColor={colors.brand}
          secureTextEntry={isSecret && !revealed}
          className="h-full flex-1 font-body text-[16px] text-fg"
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          {...props}
        />
        {isSecret ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? t('auth.hidePassword') : t('auth.showPassword')}
            hitSlop={10}
            onPress={() => setRevealed((value) => !value)}
          >
            {revealed ? (
              <EyeOff size={20} color={colors['fg-muted']} />
            ) : (
              <Eye size={20} color={colors['fg-muted']} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
});
