import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View, useWindowDimensions } from 'react-native';

import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { night } from '@/theme';
import { cn } from '@/utils/cn';

const HERO_HEIGHT = 196;
const GUTTER = 20;
const GAP = 12;

interface Slide {
  key: string;
  tag: string;
  title: string;
  cta: string;
  image: number;
  tone: 'night' | 'soft';
  onPress: () => void;
}

function HeroCard({ slide, width }: { slide: Slide; width: number }) {
  const dark = slide.tone === 'night';

  return (
    <View
      className={cn('overflow-hidden rounded-[28px]', dark ? 'bg-night-900' : 'bg-primary-50')}
      style={{ width, height: HERO_HEIGHT, borderCurve: 'continuous' }}
    >
      <Image
        source={slide.image}
        contentFit="cover"
        className="absolute bottom-0 right-0 top-0"
        style={{ width: width * 0.6 }}
        accessibilityIgnoresInvertColors
      />
      <LinearGradient
        colors={
          dark
            ? [night[900], 'rgba(11,20,66,0.85)', 'rgba(11,20,66,0)']
            : ['#eef1fc', 'rgba(238,241,252,0.9)', 'rgba(238,241,252,0)']
        }
        locations={[0.35, 0.55, 0.85]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        className="absolute inset-0"
      />
      <View className="flex-1 justify-between p-5">
        <View className="gap-3">
          <View
            className={cn('self-start rounded-full px-3 py-1', dark ? 'bg-accent-400' : 'bg-white')}
          >
            <Text variant="caption" className="font-body-bold text-[11px] text-night-900">
              {slide.tag}
            </Text>
          </View>
          <Text
            variant="title"
            className={cn('text-[23px] leading-[28px]', dark ? 'text-white' : 'text-night-900')}
          >
            {slide.title}
          </Text>
        </View>
        <Button
          title={slide.cta}
          size="sm"
          variant={dark ? 'accent' : 'primary'}
          trailingIcon={ArrowRight}
          onPress={slide.onPress}
          className="self-start"
        />
      </View>
    </View>
  );
}

export function HeroCarousel({ onExplore, onHome }: { onExplore: () => void; onHome: () => void }) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const [active, setActive] = useState(0);
  const cardWidth = screenWidth - GUTTER * 2;

  const slides: Slide[] = [
    {
      key: 'escrow',
      tag: t('home.heroEscrowTag'),
      title: t('home.heroEscrowTitle'),
      cta: t('home.heroEscrowCta'),
      image: require('@/assets/images/hero/escrow.jpg'),
      tone: 'night',
      onPress: onExplore,
    },
    {
      key: 'home',
      tag: t('home.heroHomeTag'),
      title: t('home.heroHomeTitle'),
      cta: t('home.heroHomeCta'),
      image: require('@/assets/images/hero/home.jpg'),
      tone: 'soft',
      onPress: onHome,
    },
  ];

  return (
    <View>
      <FlatList
        horizontal
        data={slides}
        keyExtractor={(slide) => slide.key}
        renderItem={({ item }) => <HeroCard slide={item} width={cardWidth} />}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + GAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: GUTTER, gap: GAP }}
        onMomentumScrollEnd={(event) =>
          setActive(Math.round(event.nativeEvent.contentOffset.x / (cardWidth + GAP)))
        }
      />
      <View className="mt-3 flex-row justify-center gap-1.5" accessibilityElementsHidden>
        {slides.map((slide, index) => (
          <View
            key={slide.key}
            className={cn(
              'h-1.5 rounded-full',
              index === active ? 'w-5 bg-action' : 'w-1.5 bg-line-strong',
            )}
          />
        ))}
      </View>
    </View>
  );
}
