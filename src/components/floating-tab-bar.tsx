import * as Haptics from 'expo-haptics';
import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScheme } from '@/hooks/use-theme';
import { night } from '@/theme';
import { cn } from '@/utils/cn';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const BAR_HEIGHT = 64;
const ITEM_SIZE = 48;

function bottomOffset(insetBottom: number) {
  return Math.max(insetBottom, 12) + 4;
}

/** Space screens must leave at the bottom so content scrolls clear of the floating bar. */
export function useTabBarSpace(): number {
  const insets = useSafeAreaInsets();
  return BAR_HEIGHT + bottomOffset(insets.bottom) + 16;
}

export function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const scheme = useScheme();

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0 items-center"
      style={{ bottom: bottomOffset(insets.bottom) }}
    >
      <View
        className={cn(
          'flex-row items-center gap-2 rounded-full px-2',
          scheme === 'dark' ? 'border border-line-strong bg-surface-raised' : 'bg-night-900',
        )}
        style={{ height: BAR_HEIGHT, boxShadow: '0 10px 30px rgba(6, 11, 38, 0.28)' }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const color = focused ? night[900] : 'rgba(255, 255, 255, 0.72)';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              Haptics.selectionAsync().catch(() => {});
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.title}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              className={cn(
                'items-center justify-center rounded-full',
                focused ? 'bg-accent-400' : 'active:bg-white/10',
              )}
              style={{ width: ITEM_SIZE + 8, height: ITEM_SIZE }}
            >
              {options.tabBarIcon?.({ focused, color, size: 22 })}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
