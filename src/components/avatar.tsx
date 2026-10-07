import { Image } from 'expo-image';
import { View } from 'react-native';

import { initials } from '@/utils/format';

import { Text } from './text';

const sizes = {
  sm: { box: 'h-9 w-9', text: 'text-[12px]' },
  md: { box: 'h-12 w-12', text: 'text-[15px]' },
  lg: { box: 'h-16 w-16', text: 'text-[20px]' },
} as const;

export function Avatar({
  name,
  url,
  size = 'md',
}: {
  name: string;
  url?: string | null;
  size?: keyof typeof sizes;
}) {
  const { box, text } = sizes[size];

  if (url) {
    return (
      <Image
        source={url}
        className={`${box} rounded-full bg-surface-muted`}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    );
  }

  return (
    <View className={`${box} items-center justify-center rounded-full bg-night-900`}>
      <Text variant="caption" className={`font-body-bold text-white ${text}`}>
        {initials(name)}
      </Text>
    </View>
  );
}
