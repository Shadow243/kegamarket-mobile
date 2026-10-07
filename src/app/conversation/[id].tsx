import { useLocalSearchParams } from 'expo-router';

import { ConversationScreen } from '@/screens/conversation';

export default function ConversationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ConversationScreen id={id} />;
}
