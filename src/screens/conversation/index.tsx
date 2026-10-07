import { useQueryClient } from '@tanstack/react-query';
import { Bot, CloudOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { StateView } from '@/components/state-view';
import { useConversations, useSupportConversation } from '@/hooks/use-conversations';
import { useIsOnline } from '@/hooks/use-is-online';
import { useThemeColors } from '@/hooks/use-theme';
import { queryKeys } from '@/lib/query/keys';
import type { Conversation } from '@/types/api';

import { Thread } from './thread';

export function ConversationScreen({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const conversations = useConversations();
  const conversation =
    conversations.data?.data.find((item) => item.id === id) ??
    queryClient.getQueryData<Conversation>(queryKeys.conversations.support());

  return (
    <Thread conversationId={id} conversation={conversation?.id === id ? conversation : undefined} />
  );
}

/** The buyer's singleton chat with the Kega assistant, created on first open. */
export function SupportScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const support = useSupportConversation(true);

  if (!support.data) {
    return (
      <SafeAreaView className="flex-1 bg-canvas">
        <ScreenHeader title={t('support.title')} />
        {support.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.fg} />
          </View>
        ) : (
          <StateView
            icon={isOnline ? Bot : CloudOff}
            title={isOnline ? t('common.genericError') : t('network.offlineUnavailable')}
            actionLabel={isOnline ? t('common.retry') : undefined}
            onAction={() => support.refetch()}
            className="flex-1 justify-center"
          />
        )}
      </SafeAreaView>
    );
  }

  return <Thread conversationId={support.data.id} conversation={support.data} support />;
}
