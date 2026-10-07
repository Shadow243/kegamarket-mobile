import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/text';
import { isPendingMessage } from '@/hooks/use-conversations';
import { useLocale } from '@/hooks/use-locale';
import type { Message } from '@/types/api';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/format';
import { groupReactions } from '@/utils/messages';

import { MessageBody } from './message-body';

function formatClock(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'ln' ? 'fr' : locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function MessageBubbleBase({
  message,
  mine,
  userId,
  onLongPress,
  onReactionPress,
}: {
  message: Message;
  mine: boolean;
  userId: string | undefined;
  onLongPress: (message: Message) => void;
  onReactionPress: (message: Message, emoji: string) => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const pending = isPendingMessage(message);
  const reactions = groupReactions(message.reactions, userId);
  const shared = message.shared_listing;

  return (
    <View
      className={cn('mb-1.5 max-w-[82%]', mine ? 'items-end self-end' : 'items-start self-start')}
    >
      <Pressable
        onLongPress={() => !pending && onLongPress(message)}
        delayLongPress={250}
        className={cn(
          'overflow-hidden rounded-[22px]',
          mine ? 'rounded-br-md bg-action' : 'rounded-bl-md bg-surface-muted',
          pending && 'opacity-60',
        )}
        style={{ borderCurve: 'continuous' }}
      >
        {message.photos.length > 0 ? (
          <View className="flex-row flex-wrap gap-0.5">
            {message.photos.map((photo, index) => (
              <Image
                key={`${photo.thumb_url}-${index}`}
                source={photo.preview_url}
                placeholder={photo.thumb_url}
                contentFit="cover"
                cachePolicy="memory-disk"
                style={{
                  width: message.photos.length === 1 ? 240 : 119,
                  height: message.photos.length === 1 ? 240 : 119,
                }}
              />
            ))}
          </View>
        ) : null}

        {shared ? (
          <Pressable
            accessibilityRole="link"
            onPress={() =>
              router.push({ pathname: '/listing/[slug]', params: { slug: shared.slug } })
            }
            className="m-1.5 w-[240px] flex-row items-center gap-3 rounded-2xl bg-surface p-2.5 active:opacity-80"
          >
            <View className="h-14 w-14 overflow-hidden rounded-xl bg-surface-muted">
              {shared.thumbnail_url ? (
                <Image source={shared.thumbnail_url} className="h-full w-full" contentFit="cover" />
              ) : null}
            </View>
            <View className="flex-1">
              <Text variant="caption" className="font-body-semibold text-fg" numberOfLines={2}>
                {shared.title}
              </Text>
              <Text variant="caption" className="mt-0.5 font-body-bold text-fg">
                {formatPrice(shared.price, shared.currency, locale)}
              </Text>
            </View>
          </Pressable>
        ) : null}

        {message.body ? (
          <View className="px-4 py-2.5">
            <MessageBody body={message.body} mine={mine} />
          </View>
        ) : null}
      </Pressable>

      {reactions.length > 0 ? (
        <View className={cn('-mt-1.5 flex-row gap-1', mine ? 'mr-2' : 'ml-2')}>
          {reactions.map((reaction) => (
            <Pressable
              key={reaction.emoji}
              accessibilityRole="button"
              accessibilityState={{ selected: reaction.reactedByMe }}
              onPress={() => onReactionPress(message, reaction.emoji)}
              className={cn(
                'flex-row items-center gap-0.5 rounded-full border px-1.5 py-0.5',
                reaction.reactedByMe ? 'border-accent-400 bg-surface' : 'border-line bg-surface',
              )}
            >
              <Text className="text-[13px]">{reaction.emoji}</Text>
              {reaction.count > 1 ? (
                <Text variant="caption" className="text-[11px] text-fg">
                  {reaction.count}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      <Text variant="caption" tone="subtle" className="mx-2 mt-1 text-[11px]">
        {pending ? t('messages.pending') : formatClock(message.created_at, locale)}
      </Text>
    </View>
  );
}

export const MessageBubble = memo(MessageBubbleBase);
