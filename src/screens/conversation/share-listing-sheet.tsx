import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/icon-button';
import { SearchBar } from '@/components/search-bar';
import { Text } from '@/components/text';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useLocale } from '@/hooks/use-locale';
import { useThemeColors } from '@/hooks/use-theme';
import { listingsApi } from '@/lib/api/endpoints';
import { formatPrice } from '@/utils/format';
import { X } from 'lucide-react-native';

export function ShareListingSheet({
  visible,
  onClose,
  onShare,
}: {
  visible: boolean;
  onClose: () => void;
  onShare: (listingId: string) => void;
}) {
  const { t } = useTranslation();
  const locale = useLocale();
  const colors = useThemeColors();
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query.trim(), 300);

  const results = useQuery({
    queryKey: ['listings', 'share-picker', search, locale],
    queryFn: async ({ signal }) => (await listingsApi.list({ search }, { signal })).data,
    enabled: visible && search.length > 0,
    meta: { persist: false },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-canvas">
        <View className="flex-row items-center justify-between px-5 pb-3 pt-4">
          <Text variant="title">{t('messages.shareListing')}</Text>
          <IconButton
            icon={X}
            variant="muted"
            accessibilityLabel={t('common.close')}
            onPress={onClose}
          />
        </View>
        <View className="px-5 pb-3">
          <SearchBar
            placeholder={t('messages.searchListings')}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
        {results.isFetching ? <ActivityIndicator className="py-6" color={colors.fg} /> : null}
        <FlatList
          data={results.data ?? []}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-5 pb-8"
          ItemSeparatorComponent={() => <View className="h-px bg-line" />}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onShare(item.id);
                setQuery('');
              }}
              className="flex-row items-center gap-3.5 py-3 active:opacity-70"
            >
              <View className="h-14 w-14 overflow-hidden rounded-xl bg-surface-muted">
                {item.thumbnail_url ? (
                  <Image source={item.thumbnail_url} className="h-full w-full" contentFit="cover" />
                ) : null}
              </View>
              <View className="flex-1">
                <Text variant="callout" numberOfLines={1}>
                  {item.localized_title}
                </Text>
                <Text variant="caption" tone="muted">
                  {formatPrice(item.price, item.currency, locale)} · {item.city}
                </Text>
              </View>
            </Pressable>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}
