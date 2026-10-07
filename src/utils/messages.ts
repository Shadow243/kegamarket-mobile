import type { InfiniteData } from '@tanstack/react-query';

import type { Message, Paginated } from '@/types/api';

export type MessagePages = InfiniteData<Paginated<Message>>;

export function flattenMessages(data: MessagePages | undefined): Message[] {
  return data?.pages.flatMap((page) => page.data) ?? [];
}

/** Replaces a message in place (reactions changed) or appends it to the newest page; never duplicates. */
export function upsertMessage(
  data: MessagePages | undefined,
  message: Message,
): MessagePages | undefined {
  if (!data || data.pages.length === 0) return data;

  const exists = data.pages.some((page) => page.data.some((item) => item.id === message.id));
  if (exists) {
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        data: page.data.map((item) => (item.id === message.id ? message : item)),
      })),
    };
  }

  const last = data.pages.length - 1;
  return {
    ...data,
    pages: data.pages.map((page, index) =>
      index === last ? { ...page, data: [...page.data, message] } : page,
    ),
  };
}

export function removeMessage(
  data: MessagePages | undefined,
  messageId: string,
): MessagePages | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: page.data.filter((item) => item.id !== messageId),
    })),
  };
}

export interface ReactionGroup {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

export function groupReactions(
  reactions: Message['reactions'],
  userId: string | undefined,
): ReactionGroup[] {
  const groups = new Map<string, ReactionGroup>();
  for (const reaction of reactions) {
    const group = groups.get(reaction.emoji) ?? {
      emoji: reaction.emoji,
      count: 0,
      reactedByMe: false,
    };
    group.count += 1;
    if (reaction.user_id === userId) group.reactedByMe = true;
    groups.set(reaction.emoji, group);
  }
  return Array.from(groups.values());
}

export type ChatSegment =
  | { type: 'text'; text: string }
  | { type: 'listing'; slug: string }
  | { type: 'link'; href: string };

const URL_PATTERN = /https?:\/\/[^\s<>"']+/g;
const TRAILING_PUNCTUATION = /[.,;:!?)\]]+$/;
const LISTING_PATH = /^https?:\/\/[^/]+(?:\/[a-z]{2})?\/listing\/([^/?#]+)/;

/**
 * Splits a message into text and links. Links to a listing on the Kega site become in-app
 * listing chips (the support assistant points buyers to listings this way); others open externally.
 */
export function splitChatLinks(body: string, siteUrl: string): ChatSegment[] {
  const siteHost = siteUrl
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');
  const segments: ChatSegment[] = [];
  let cursor = 0;

  for (const match of body.matchAll(URL_PATTERN)) {
    const url = match[0].replace(TRAILING_PUNCTUATION, '');
    const start = match.index ?? 0;
    if (start > cursor) segments.push({ type: 'text', text: body.slice(cursor, start) });

    const host = url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/[/?#].*$/, '');
    const listing = host === siteHost ? LISTING_PATH.exec(url) : null;
    segments.push(
      listing
        ? { type: 'listing', slug: decodeURIComponent(listing[1]) }
        : { type: 'link', href: url },
    );

    cursor = start + url.length;
  }

  if (cursor < body.length) segments.push({ type: 'text', text: body.slice(cursor) });
  return segments;
}
