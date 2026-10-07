import { Tabs } from 'expo-router';
import {
  Heart,
  House,
  MessageCircle,
  Search,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { ColorValue } from 'react-native';

import { FloatingTabBar } from '@/components/floating-tab-bar';
import { useUnreadTotal } from '@/hooks/use-conversations';

function tabIcon(Icon: LucideIcon) {
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Icon color={color as string} size={22} strokeWidth={focused ? 2.4 : 2} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const unread = useUnreadTotal();

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: tabIcon(House) }} />
      <Tabs.Screen
        name="search"
        options={{ title: t('tabs.search'), tabBarIcon: tabIcon(Search) }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t('tabs.messages'),
          tabBarIcon: tabIcon(MessageCircle),
          tabBarBadge: unread > 0 ? unread : undefined,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{ title: t('tabs.favorites'), tabBarIcon: tabIcon(Heart) }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: t('tabs.orders'), tabBarIcon: tabIcon(ShoppingBag) }}
      />
    </Tabs>
  );
}
