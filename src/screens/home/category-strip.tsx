import { ScrollView, Pressable, View } from 'react-native';

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
      contentContainerClassName="gap-3 px-4"
    >
      {isLoading && !categories
        ? Array.from({ length: 5 }, (_, index) => (
            <View key={index} className="w-[76px] items-center gap-2">
              <Skeleton className="h-16 w-16 rounded-2xl" />
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
                className="w-[76px] items-center gap-2 active:opacity-70"
              >
                <View
                  className="h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft"
                  style={{ borderCurve: 'continuous' }}
                >
                  <Icon size={26} color={colors.brand} strokeWidth={1.9} />
                </View>
                <Text variant="caption" numberOfLines={2} className="text-center text-fg">
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
    </ScrollView>
  );
}
