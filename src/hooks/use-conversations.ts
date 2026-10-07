import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { conversationsApi, type OutgoingMessage } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import { getEcho } from '@/lib/realtime';
import { useAuthStore } from '@/stores/auth-store';
import type { Message } from '@/types/api';
import { removeMessage, upsertMessage, type MessagePages } from '@/utils/messages';

import { useCurrentUser } from './use-session';

const LATEST_PAGE = 0;
const FALLBACK_POLL_INTERVAL = 15_000;

export function useConversations() {
  const isSignedIn = useAuthStore((state) => state.token !== null);
  return useQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: ({ signal }) => conversationsApi.list({ signal }),
    enabled: isSignedIn,
    refetchInterval: getEcho() ? 60_000 : FALLBACK_POLL_INTERVAL,
  });
}

export function useUnreadTotal(): number {
  return useConversations().data?.meta.unread_total ?? 0;
}

export function useSupportConversation(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.conversations.support(),
    queryFn: async ({ signal }) => (await conversationsApi.support({ signal })).conversation,
    enabled,
    staleTime: Infinity,
  });
}

/** Opens the thread at its newest page; older pages load as the user scrolls up. */
export function useConversationMessages(id: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.conversations.messages(id),
    queryFn: async ({ pageParam, signal }) => {
      if (pageParam !== LATEST_PAGE) return conversationsApi.messages(id, pageParam, { signal });
      const first = await conversationsApi.messages(id, 1, { signal });
      return first.meta.last_page > 1
        ? conversationsApi.messages(id, first.meta.last_page, { signal })
        : first;
    },
    initialPageParam: LATEST_PAGE,
    getPreviousPageParam: (firstPage) =>
      firstPage.meta.current_page > 1 ? firstPage.meta.current_page - 1 : undefined,
    getNextPageParam: () => undefined,
    refetchInterval: getEcho() ? false : FALLBACK_POLL_INTERVAL,
  });
}

function useMessageCache(id: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.conversations.messages(id);
  return {
    upsert: (message: Message) =>
      queryClient.setQueryData<MessagePages>(key, (data) => upsertMessage(data, message)),
    remove: (messageId: string) =>
      queryClient.setQueryData<MessagePages>(key, (data) => removeMessage(data, messageId)),
    refreshList: () => queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() }),
  };
}

export function useMarkRead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => conversationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() }),
  });
}

/** Live updates for one thread: new messages, reaction changes and deletions. */
export function useConversationChannel(id: string, onIncoming?: () => void) {
  const cache = useMessageCache(id);

  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;
    const name = `conversation.${id}`;
    echo
      .private(name)
      .listen('.message.sent', (event: { message: Message }) => {
        cache.upsert(event.message);
        cache.refreshList();
        onIncoming?.();
      })
      .listen('.message.reaction.toggled', (event: { message: Message }) =>
        cache.upsert(event.message),
      )
      .listen('.message.deleted', (event: { message_id: string }) =>
        cache.remove(event.message_id),
      );
    return () => echo.leave(name);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resubscribe only when the thread changes
  }, [id]);
}

/**
 * Optimistic send: the bubble appears at once (marked pending), then is swapped for the
 * server's copy. On failure it's removed and the caller restores the draft.
 */
export function useSendMessage(id: string) {
  const cache = useMessageCache(id);
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (message: OutgoingMessage & { tempId: string }) =>
      (await conversationsApi.send(id, message)).message,
    onMutate: (message) => {
      if (!user) return;
      cache.upsert({
        id: message.tempId,
        conversation_id: id,
        body: message.body ?? null,
        sender: { id: user.id, name: user.name, avatar_url: user.avatar_url },
        shared_listing: null,
        shared_job_posting: null,
        photos: (message.photos ?? []).map((photo) => ({
          thumb_url: photo.uri,
          preview_url: photo.uri,
        })),
        reactions: [],
        created_at: new Date().toISOString(),
      });
    },
    onSuccess: (sent, message) => {
      cache.remove(message.tempId);
      cache.upsert(sent);
      cache.refreshList();
    },
    onError: (_error, message) => cache.remove(message.tempId),
  });
}

export function isPendingMessage(message: Message): boolean {
  return message.id.startsWith('temp-');
}

export function useToggleReaction(id: string) {
  const cache = useMessageCache(id);
  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      (await conversationsApi.toggleReaction(id, messageId, emoji)).message,
    onSuccess: cache.upsert,
  });
}

export function useDeleteMessage(id: string) {
  const cache = useMessageCache(id);
  return useMutation({
    mutationFn: (messageId: string) => conversationsApi.remove(id, messageId),
    onSuccess: (_result, messageId) => cache.remove(messageId),
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listingId: string) => (await conversationsApi.start(listingId)).conversation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() }),
  });
}
