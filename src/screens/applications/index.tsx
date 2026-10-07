import { BriefcaseBusiness, CloudOff, Paperclip } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { ScreenHeader } from '@/components/screen-header';
import { Skeleton } from '@/components/skeleton';
import { StateView } from '@/components/state-view';
import { StatusBadge } from '@/components/status-badge';
import { Text } from '@/components/text';
import { useApplications } from '@/hooks/use-applications';
import { useIsOnline } from '@/hooks/use-is-online';
import { useLocale } from '@/hooks/use-locale';
import { useThemeColors } from '@/hooks/use-theme';
import type { JobApplication, JobApplicationStatus } from '@/types/api';
import { formatTimeAgo, initials } from '@/utils/format';
import type { StatusTone } from '@/utils/order-status';

type Filter = 'all' | JobApplicationStatus;

const FILTERS: {
  key: Filter;
  label:
    | 'applications.filterAll'
    | 'applications.filterPending'
    | 'applications.filterSelected'
    | 'applications.filterRejected';
}[] = [
  { key: 'all', label: 'applications.filterAll' },
  { key: 'pending', label: 'applications.filterPending' },
  { key: 'selected', label: 'applications.filterSelected' },
  { key: 'rejected', label: 'applications.filterRejected' },
];

const TONES: Record<JobApplicationStatus, StatusTone> = {
  pending: 'warning',
  selected: 'success',
  rejected: 'danger',
};

function ApplicationCard({ application }: { application: JobApplication }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const colors = useThemeColors();
  const title = application.job_posting?.title ?? '—';

  return (
    <View
      className="rounded-[24px] border border-line bg-surface p-4"
      style={{ borderCurve: 'continuous' }}
    >
      <View className="flex-row gap-3.5">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-night-900">
          <Text variant="callout" tone="white">
            {initials(application.job_posting?.shop?.name ?? title)}
          </Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text variant="callout" numberOfLines={2}>
            {title}
          </Text>
          {application.job_posting?.shop ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {application.job_posting.shop.name}
            </Text>
          ) : null}
          <Text variant="caption" tone="subtle" className="text-[12px]">
            {t('applications.sentAgo', { time: formatTimeAgo(application.created_at, locale) })}
          </Text>
        </View>
        <StatusBadge
          label={t(`applications.status.${application.status}`)}
          tone={TONES[application.status]}
        />
      </View>
      {application.documents.length > 0 ? (
        <View className="mt-3.5 flex-row items-center gap-1.5 border-t border-line pt-3.5">
          <Paperclip size={14} color={colors['fg-subtle']} />
          <Text variant="caption" tone="muted" numberOfLines={1} className="flex-1">
            {application.documents.map((document) => document.label).join(', ')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function Applications() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const applications = useApplications();
  const [filter, setFilter] = useState<Filter>('all');

  const all = useMemo(() => applications.data ?? [], [applications.data]);
  const visible = useMemo(
    () => all.filter((application) => filter === 'all' || application.status === filter),
    [all, filter],
  );

  const empty =
    applications.data === undefined && !isOnline ? (
      <StateView icon={CloudOff} title={t('network.offlineUnavailable')} />
    ) : (
      <StateView
        icon={BriefcaseBusiness}
        title={filter === 'all' ? t('applications.emptyAll') : t('applications.empty')}
      />
    );

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScreenHeader title={t('applications.title')} />
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-5 py-3"
        >
          {FILTERS.map(({ key, label }) => (
            <Chip
              key={key}
              label={`${t(label)} (${key === 'all' ? all.length : all.filter((item) => item.status === key).length})`}
              selected={filter === key}
              onPress={() => setFilter(key)}
            />
          ))}
        </ScrollView>
      </View>
      {applications.isLoading ? (
        <View className="gap-3 px-5 pt-2">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-[110px] w-full rounded-[24px]" />
          ))}
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ApplicationCard application={item} />}
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListEmptyComponent={empty}
          contentContainerClassName="px-5 pb-12 pt-2"
          refreshControl={
            <RefreshControl
              refreshing={applications.isRefetching}
              onRefresh={() => applications.refetch()}
              tintColor={colors.fg}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
