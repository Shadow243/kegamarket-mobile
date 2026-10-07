import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View, useWindowDimensions } from 'react-native';

import { Text } from '@/components/text';
import type { ListingDetail } from '@/types/api';

export function Gallery({
  photos,
  title,
  height,
}: {
  photos: ListingDetail['photos'];
  title: string;
  height: number;
}) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return <View className="bg-surface-muted" style={{ width, height }} />;
  }

  return (
    <View className="bg-surface-muted" style={{ height }}>
      <FlatList
        horizontal
        pagingEnabled
        data={photos}
        keyExtractor={(photo) => photo.preview_url}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) =>
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item, index: position }) => (
          <Image
            source={item.preview_url}
            placeholder={item.thumb_url}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            style={{ width, height }}
            accessibilityLabel={`${title} — ${t('listing.photoOfTotal', { current: position + 1, total: photos.length })}`}
          />
        )}
      />
      {photos.length > 1 ? (
        <View className="absolute bottom-12 right-5 rounded-full bg-black/45 px-3 py-1">
          <Text variant="caption" tone="white" className="font-body-semibold">
            {index + 1} / {photos.length}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
