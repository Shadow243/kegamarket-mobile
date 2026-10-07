import { useFocusEffect, useRouter } from 'expo-router';
import { Bot, ChevronRight, CloudOff, MessagesSquare } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { useTabBarSpace } from '@/components/floating-tab-bar';
import { Skeleton } from '@/components/skeleton';
import { StateView } from '@/components/state-view';
import { Text } from '@/components/text';
import { useConversations } from '@/hooks/use-conversations';
import { useIsOnline } from '@/hooks/use-is-online';
import { useLocale } from '@/hooks/use-locale';
import { useCurrentUser } from '@/hooks/use-session';
import { useThemeColors } from '@/hooks/use-theme';
import { queryKeys } from '@/lib/query/keys';
import { night, palette } from '@/theme';
import type { Conversation } from '@/types/api';
import { formatTimeAgo } from '@/utils/format';
import { useQueryClient } from '@tanstack/react-query';

function AssistantCard() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/support')}
      className="mb-5 flex-row items-center gap-4 rounded-[24px] bg-night-900 p-4 active:opacity-90"
      style={{ borderCurve: 'continuous' }}
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-accent-400">
        <Bot size={24} color={night[900]} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text variant="callout" tone="white">
          {t('support.title')}
        </Text>
        <Text variant="caption" className="mt-0.5 text-primary-100">
          {t('support.subtitle')}
        </Text>
      </View>
      <ChevronRight size={20} color={palette.white} />
    </Pressable>
  );
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const { user } = useCurrentUser();
  const other = conversation.other_participant;
  const last = conversation.last_message;
  const unread = conversation.unread_count > 0;

  const preview = !last
    ? ''
    : `${last.sender_id === user?.id ? t('messages.you') : ''}${
        last.body ||
        (last.has_photos ? t('messages.photo') : last.is_share ? t('messages.sharedListing') : '')
      }`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: '/conversation/[id]', params: { id: conversation.id } })
      }
      className="flex-row items-center gap-3.5 py-3 active:opacity-70"
    >
      <Avatar name={other?.name ?? '?'} url={other?.avatar_url} />
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text variant="callout" numberOfLines={1} className="flex-1">
            {other?.name ?? '—'}
          </Text>
          {last ? (
            <Text variant="caption" tone={unread ? 'default' : 'subtle'} className="text-[12px]">
              {formatTimeAgo(last.created_at, locale)}
            </Text>
          ) : null}
        </View>
        {conversation.listing ? (
          <Text variant="caption" tone="muted" numberOfLines={1} className="text-[12px]">
            {conversation.listing.title}
          </Text>
        ) : null}
        <View className="flex-row items-center gap-2">
          <Text
            variant="caption"
            numberOfLines={1}
            className={unread ? 'flex-1 font-body-bold text-fg' : 'flex-1 text-fg-muted'}
          >
            {preview}
          </Text>
          {unread ? (
            <View className="h-5 min-w-5 items-center justify-center rounded-full bg-accent-400 px-1.5">
              <Text variant="caption" className="font-body-bold text-[11px] text-night-900">
                {conversation.unread_count}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export function Messages() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const bottomSpace = useTabBarSpace();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useCurrentUser();
  const conversations = useConversations();
  const supportId = queryClient.getQueryData<Conversation>(queryKeys.conversations.support())?.id;

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) conversations.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh each time the tab gains focus
    }, [isAuthenticated]),
  );

  const list = useMemo(
    () => (conversations.data?.data ?? []).filter((conversation) => conversation.id !== supportId),
    [conversations.data, supportId],
  );

  const header = (
    <View>
      <Text variant="display" accessibilityRole="header" className="mb-5">
        {t('messages.title')}
      </Text>
      {isAuthenticated ? <AssistantCard /> : null}
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
        <View className="px-5 pt-2">{header}</View>
        <StateView
          icon={MessagesSquare}
          title={t('messages.guestTitle')}
          body={t('messages.guestBody')}
          actionLabel={t('auth.login')}
          onAction={() => router.push('/login')}
          className="flex-1 justify-center pb-32"
        />
      </SafeAreaView>
    );
  }

  const empty = conversations.isLoading ? (
    <View className="gap-4">
      {[0, 1, 2, 3].map((index) => (
        <View key={index} className="flex-row items-center gap-3.5">
          <Skeleton className="h-12 w-12 rounded-full" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-4/5" />
          </View>
        </View>
      ))}
    </View>
  ) : conversations.data === undefined && !isOnline ? (
    <StateView icon={CloudOff} title={t('network.offlineUnavailable')} />
  ) : (
    <StateView icon={MessagesSquare} title={t('messages.empty')} body={t('messages.emptyBody')} />
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConversationRow conversation={item} />}
        ItemSeparatorComponent={() => <View className="ml-[62px] h-px bg-line" />}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerClassName="px-5 pt-2"
        contentContainerStyle={{ paddingBottom: bottomSpace }}
        refreshControl={
          <RefreshControl
            refreshing={conversations.isRefetching}
            onRefresh={() => conversations.refetch()}
            tintColor={colors.fg}
          />
        }
      />
    </SafeAreaView>
  );
}
