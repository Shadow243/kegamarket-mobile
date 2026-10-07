import { useRouter } from 'expo-router';
import { BellRing, CloudOff, Search, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Pressable, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormMessage } from '@/components/form-message';
import { ScreenHeader } from '@/components/screen-header';
import { Skeleton } from '@/components/skeleton';
import { StateView } from '@/components/state-view';
import { Text } from '@/components/text';
import { useIsOnline } from '@/hooks/use-is-online';
import { useLocale } from '@/hooks/use-locale';
import { useDeleteSavedSearch, useSavedSearches } from '@/hooks/use-saved-searches';
import { useThemeColors } from '@/hooks/use-theme';
import type { SavedSearch } from '@/types/api';
import { formatTimeAgo } from '@/utils/format';
import { describeSavedSearch, savedSearchParams } from '@/utils/saved-search';

function SavedSearchRow({
  savedSearch,
  onDelete,
}: {
  savedSearch: SavedSearch;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const colors = useThemeColors();
  const summary = describeSavedSearch(savedSearch.filters);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={t('savedSearches.viewResults')}
      onPress={() =>
        router.push({ pathname: '/search', params: savedSearchParams(savedSearch.filters) })
      }
      className="flex-row items-center gap-3.5 rounded-[24px] border border-line bg-surface p-4 active:opacity-85"
      style={{ borderCurve: 'continuous' }}
    >
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface-muted">
        <Search size={20} color={colors.fg} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text variant="callout" numberOfLines={1}>
          {savedSearch.name || summary || t('savedSearches.defaultName')}
        </Text>
        {savedSearch.name && summary ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {summary}
          </Text>
        ) : null}
        <Text variant="caption" tone="subtle" className="text-[12px]">
          {t('savedSearches.savedAgo', { time: formatTimeAgo(savedSearch.created_at, locale) })}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('savedSearches.delete')}
        hitSlop={10}
        onPress={onDelete}
      >
        <Trash2 size={19} color={colors['fg-subtle']} />
      </Pressable>
    </Pressable>
  );
}

export function SavedSearches() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const savedSearches = useSavedSearches();
  const remove = useDeleteSavedSearch();

  const confirmDelete = (savedSearch: SavedSearch) =>
    Alert.alert(t('savedSearches.delete'), t('savedSearches.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('savedSearches.delete'),
        style: 'destructive',
        onPress: () => remove.mutate(savedSearch.id),
      },
    ]);

  const empty =
    savedSearches.data === undefined && !isOnline ? (
      <StateView icon={CloudOff} title={t('network.offlineUnavailable')} />
    ) : (
      <StateView
        icon={BellRing}
        title={t('savedSearches.empty')}
        body={t('savedSearches.subtitle')}
        actionLabel={t('savedSearches.browse')}
        onAction={() => router.push('/search')}
      />
    );

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScreenHeader title={t('savedSearches.title')} />
      {savedSearches.isLoading ? (
        <View className="gap-3 px-5 pt-4">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-[84px] w-full rounded-[24px]" />
          ))}
        </View>
      ) : (
        <FlatList
          data={savedSearches.data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SavedSearchRow savedSearch={item} onDelete={() => confirmDelete(item)} />
          )}
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListHeaderComponent={
            savedSearches.data?.length ? (
              <View className="mb-4 gap-3">
                <Text tone="muted">{t('savedSearches.subtitle')}</Text>
                {remove.isError ? (
                  <FormMessage type="error" message={t('savedSearches.deleteError')} />
                ) : null}
              </View>
            ) : null
          }
          ListEmptyComponent={empty}
          contentContainerClassName="px-5 pb-12 pt-3"
          refreshControl={
            <RefreshControl
              refreshing={savedSearches.isRefetching}
              onRefresh={() => savedSearches.refetch()}
              tintColor={colors.fg}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
