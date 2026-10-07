import type { Message, Paginated } from '@/types/api';

import {
  flattenMessages,
  groupReactions,
  removeMessage,
  splitChatLinks,
  upsertMessage,
  type MessagePages,
} from './messages';

const message = (id: string, body = id): Message =>
  ({ id, body, reactions: [], photos: [] }) as unknown as Message;

const page = (...messages: Message[]): Paginated<Message> => ({
  data: messages,
  meta: { current_page: 1, last_page: 1, per_page: 50, total: messages.length },
});

const pages = (...list: Paginated<Message>[]): MessagePages => ({
  pages: list,
  pageParams: list.map((_, index) => index + 1),
});

describe('message cache', () => {
  it('appends a new message to the newest page', () => {
    const result = upsertMessage(pages(page(message('a')), page(message('b'))), message('c'));

    expect(flattenMessages(result).map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });

  it('replaces a message already present instead of duplicating it', () => {
    const result = upsertMessage(pages(page(message('a'), message('b'))), message('a', 'edited'));

    expect(flattenMessages(result).map((item) => item.body)).toEqual(['edited', 'b']);
  });

  it('removes a deleted message from any page', () => {
    const result = removeMessage(pages(page(message('a')), page(message('b'))), 'a');

    expect(flattenMessages(result).map((item) => item.id)).toEqual(['b']);
  });

  it('leaves an unloaded thread untouched', () => {
    expect(upsertMessage(undefined, message('a'))).toBeUndefined();
  });
});

describe('groupReactions', () => {
  it('counts each emoji and flags the ones I added', () => {
    const groups = groupReactions(
      [
        { emoji: '👍', user_id: 'me' },
        { emoji: '👍', user_id: 'other' },
        { emoji: '❤️', user_id: 'other' },
      ],
      'me',
    );

    expect(groups).toEqual([
      { emoji: '👍', count: 2, reactedByMe: true },
      { emoji: '❤️', count: 1, reactedByMe: false },
    ]);
  });
});

describe('splitChatLinks', () => {
  const site = 'https://kegamarket.com';

  it('turns a Kega listing link into a listing chip, keeping the surrounding text', () => {
    expect(
      splitChatLinks('Voici : https://kegamarket.com/listing/frigo-lg. Bonne journée', site),
    ).toEqual([
      { type: 'text', text: 'Voici : ' },
      { type: 'listing', slug: 'frigo-lg' },
      { type: 'text', text: '. Bonne journée' },
    ]);
  });

  it('recognizes localized listing links', () => {
    expect(splitChatLinks('https://www.kegamarket.com/en/listing/velo', site)).toEqual([
      { type: 'listing', slug: 'velo' },
    ]);
  });

  it('keeps other links external', () => {
    expect(splitChatLinks('see https://example.com/listing/x', site)).toEqual([
      { type: 'text', text: 'see ' },
      { type: 'link', href: 'https://example.com/listing/x' },
    ]);
  });
});
