import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ArrowRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, Text as RNText, View } from 'react-native';

import { Text } from '@/components/text';
import { SITE_URL } from '@/lib/config';
import { night } from '@/theme';
import { splitChatLinks } from '@/utils/messages';

export function MessageBody({ body, mine }: { body: string; mine: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const segments = splitChatLinks(body, SITE_URL);
  const textClass = mine ? 'text-on-action' : 'text-fg';

  const inline = segments.filter((segment) => segment.type !== 'listing');
  const listings = segments.filter((segment) => segment.type === 'listing');

  return (
    <View className="gap-2">
      {inline.some((segment) => (segment.type === 'text' ? segment.text.trim() : true)) ? (
        <Text className={`text-[15px] leading-[21px] ${textClass}`}>
          {inline.map((segment, index) =>
            segment.type === 'link' ? (
              <RNText
                key={index}
                accessibilityRole="link"
                onPress={() => WebBrowser.openBrowserAsync(segment.href)}
                className="underline"
              >
                {segment.href}
              </RNText>
            ) : segment.type === 'text' ? (
              <RNText key={index}>{segment.text}</RNText>
            ) : null,
          )}
        </Text>
      ) : null}
      {listings.map((segment, index) =>
        segment.type === 'listing' ? (
          <Pressable
            key={`${segment.slug}-${index}`}
            accessibilityRole="link"
            onPress={() =>
              router.push({ pathname: '/listing/[slug]', params: { slug: segment.slug } })
            }
            className="flex-row items-center gap-1.5 self-start rounded-full bg-accent-400 px-3 py-1.5 active:opacity-80"
          >
            <Text variant="caption" className="font-body-bold text-night-900">
              {t('support.viewListing')}
            </Text>
            <ArrowRight size={14} color={night[900]} strokeWidth={2.5} />
          </Pressable>
        ) : null,
      )}
    </View>
  );
}
