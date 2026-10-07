import { Pressable, ScrollView, View } from 'react-native';

import { Skeleton } from '@/components/skeleton';
import { Text } from '@/components/text';
import { useThemeColors } from '@/hooks/use-theme';
import type { Category } from '@/types/api';
import { categoryIcon } from '@/utils/category-icon';

export function CategoryStrip({
  categories,
  isLoading,
  onSelect,
}: {
  categories: Category[] | undefined;
  isLoading: boolean;
  onSelect: (slug: string) => void;
}) {
  const colors = useThemeColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-4 px-5"
    >
      {isLoading && !categories
        ? Array.from({ length: 5 }, (_, index) => (
            <View key={index} className="w-[68px] items-center gap-2">
              <Skeleton className="h-[68px] w-[68px] rounded-[22px]" />
              <Skeleton className="h-3 w-12" />
            </View>
          ))
        : categories?.map((category) => {
            const Icon = categoryIcon(category.icon);
            return (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                accessibilityLabel={category.name}
                onPress={() => onSelect(category.slug)}
                className="w-[68px] items-center gap-2 active:opacity-70"
              >
                <View
                  className="h-[68px] w-[68px] items-center justify-center rounded-[22px] bg-surface-muted"
                  style={{ borderCurve: 'continuous' }}
                >
                  <Icon size={26} color={colors.fg} strokeWidth={1.75} />
                </View>
                <Text
                  variant="caption"
                  numberOfLines={1}
                  className="text-center text-[12px] text-fg"
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
    </ScrollView>
  );
}
