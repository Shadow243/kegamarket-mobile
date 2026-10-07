import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, Bot, ChevronRight, CloudOff } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { IconButton } from '@/components/icon-button';
import { Text } from '@/components/text';
import {
  isPendingMessage,
  useConversationChannel,
  useConversationMessages,
  useDeleteMessage,
  useMarkRead,
  useSendMessage,
  useToggleReaction,
} from '@/hooks/use-conversations';
import { useIsOnline } from '@/hooks/use-is-online';
import { useNow } from '@/hooks/use-now';
import { useCurrentUser } from '@/hooks/use-session';
import { useThemeColors } from '@/hooks/use-theme';
import { errorMessage } from '@/lib/api/errors';
import type { OutgoingMessage } from '@/lib/api/endpoints';
import { setOpenConversation } from '@/lib/push';
import { night } from '@/theme';
import type { Conversation, Message } from '@/types/api';
import { flattenMessages } from '@/utils/messages';

import { Composer } from './composer';
import { MessageActions } from './message-actions';
import { MessageBubble } from './message-bubble';
import { ShareListingSheet } from './share-listing-sheet';

const TYPING_WINDOW_MS = 90_000;

function Header({ conversation, support }: { conversation?: Conversation; support: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const other = conversation?.other_participant;

  return (
    <View className="flex-row items-center gap-3 border-b border-line px-4 pb-3 pt-1">
      <IconButton
        icon={ArrowLeft}
        accessibilityLabel={t('common.back')}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/messages'))}
      />
      {support ? (
        <View className="h-11 w-11 items-center justify-center rounded-full bg-accent-400">
          <Bot size={22} color={night[900]} />
        </View>
      ) : (
        <Avatar name={other?.name ?? '?'} url={other?.avatar_url} size="sm" />
      )}
      <View className="flex-1">
        <Text variant="callout" numberOfLines={1} accessibilityRole="header">
          {support ? t('support.title') : (other?.name ?? '')}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1} className="text-[12px]">
          {support ? t('support.subtitle') : (conversation?.listing?.title ?? '')}
        </Text>
      </View>
    </View>
  );
}

function ListingBanner({ listing }: { listing: NonNullable<Conversation['listing']> }) {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push({ pathname: '/listing/[slug]', params: { slug: listing.slug } })}
      className="mx-4 mt-3 flex-row items-center gap-3 rounded-2xl bg-surface-muted p-2.5 active:opacity-80"
    >
      <View className="h-11 w-11 overflow-hidden rounded-xl bg-surface">
        {listing.thumbnail_url ? (
          <Image source={listing.thumbnail_url} className="h-full w-full" contentFit="cover" />
        ) : null}
      </View>
      <Text variant="caption" className="flex-1 font-body-semibold text-fg" numberOfLines={1}>
        {listing.title}
      </Text>
      <ChevronRight size={18} color={colors['fg-subtle']} />
    </Pressable>
  );
}

function TypingBubble() {
  const colors = useThemeColors();
  return (
    <View className="mb-1.5 self-start rounded-[22px] rounded-bl-md bg-surface-muted px-4 py-3">
      <ActivityIndicator size="small" color={colors['fg-muted']} />
    </View>
  );
}

export function Thread({
  conversationId,
  conversation,
  support = false,
}: {
  conversationId: string;
  conversation?: Conversation;
  support?: boolean;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const { user } = useCurrentUser();
  const messagesQuery = useConversationMessages(conversationId);
  const markRead = useMarkRead(conversationId);
  const send = useSendMessage(conversationId);
  const react = useToggleReaction(conversationId);
  const remove = useDeleteMessage(conversationId);
  const [selected, setSelected] = useState<Message | null>(null);
  const [sharing, setSharing] = useState(false);
  const now = useNow();

  const markAsRead = useCallback(() => {
    if (isOnline) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the mutation object is stable enough for this
  }, [isOnline, conversationId]);

  useEffect(markAsRead, [markAsRead]);
  useConversationChannel(conversationId, markAsRead);
  useFocusEffect(
    useCallback(() => {
      setOpenConversation(conversationId);
      return () => setOpenConversation(null);
    }, [conversationId]),
  );

  const messages = useMemo(() => flattenMessages(messagesQuery.data), [messagesQuery.data]);
  const inverted = useMemo(() => [...messages].reverse(), [messages]);
  const last = messages[messages.length - 1];
  const assistantTyping =
    support &&
    last !== undefined &&
    last.sender.id === user?.id &&
    !isPendingMessage(last) &&
    now - new Date(last.created_at).getTime() < TYPING_WINDOW_MS;

  const sendMessage = async (message: OutgoingMessage) => {
    try {
      await send.mutateAsync({ ...message, tempId: `temp-${Date.now()}` });
      return true;
    } catch (error) {
      Alert.alert(
        t('messages.send'),
        errorMessage(error, t('messages.sendError'), t('common.networkError')),
      );
      return false;
    }
  };

  const onLongPress = useCallback((message: Message) => setSelected(message), []);
  const onReactionPress = useCallback(
    (message: Message, emoji: string) => react.mutate({ messageId: message.id, emoji }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mutate is stable
    [conversationId],
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-canvas">
      <Header conversation={conversation} support={support} />
      {conversation?.listing && !support ? <ListingBanner listing={conversation.listing} /> : null}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {support && !messagesQuery.isLoading && messages.length === 0 ? (
          <View className="mx-4 mt-3 max-w-[82%] self-start rounded-[22px] rounded-bl-md bg-surface-muted px-4 py-3">
            <Text className="text-[15px] leading-[21px]">{t('support.greeting')}</Text>
          </View>
        ) : null}
        <FlatList
          inverted
          data={inverted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              mine={item.sender.id === user?.id}
              userId={user?.id}
              onLongPress={onLongPress}
              onReactionPress={onReactionPress}
            />
          )}
          ListHeaderComponent={assistantTyping ? <TypingBubble /> : null}
          ListFooterComponent={
            messagesQuery.isFetchingPreviousPage || messagesQuery.isLoading ? (
              <ActivityIndicator className="py-4" color={colors.fg} />
            ) : null
          }
          onEndReached={() => {
            if (messagesQuery.hasPreviousPage && !messagesQuery.isFetchingPreviousPage)
              messagesQuery.fetchPreviousPage();
          }}
          onEndReachedThreshold={0.3}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-4 py-3"
        />

        {!isOnline ? (
          <View className="flex-row items-center justify-center gap-1.5 px-4 pb-1.5">
            <CloudOff size={14} color={colors['fg-muted']} />
            <Text variant="caption" tone="muted">
              {t('messages.offlineComposer')}
            </Text>
          </View>
        ) : null}

        <Composer
          placeholder={support ? t('support.placeholder') : t('messages.placeholder')}
          onSend={sendMessage}
          onShareListing={support ? undefined : () => setSharing(true)}
          allowAttachments={!support}
        />
      </KeyboardAvoidingView>

      <MessageActions
        message={selected}
        canDelete={selected?.sender.id === user?.id}
        onReact={(emoji) => {
          if (selected) react.mutate({ messageId: selected.id, emoji });
          setSelected(null);
        }}
        onDelete={() => {
          if (selected) remove.mutate(selected.id);
          setSelected(null);
        }}
        onClose={() => setSelected(null)}
      />

      <ShareListingSheet
        visible={sharing}
        onClose={() => setSharing(false)}
        onShare={(listingId) => {
          setSharing(false);
          sendMessage({ sharedListingId: listingId });
        }}
      />
    </SafeAreaView>
  );
}
