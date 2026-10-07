import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, BadgeCheck, Globe, ScanSearch, ShieldCheck } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Text } from '@/components/text';
import { usePreferencesStore } from '@/stores/preferences-store';
import { palette } from '@/theme';
import { cn } from '@/utils/cn';

const logoLight = require('@/assets/images/logo-kega-light.png');

const SLIDES = [
  { key: '1', image: require('@/assets/images/welcome/slide-1.jpg') },
  { key: '2', image: require('@/assets/images/welcome/slide-2.jpg') },
  { key: '3', image: require('@/assets/images/welcome/slide-3.jpg') },
] as const;

const COPY = [
  { title: 'welcome.slide1Title', body: 'welcome.slide1Body' },
  { title: 'welcome.slide2Title', body: 'welcome.slide2Body' },
  { title: 'welcome.slide3Title', body: 'welcome.slide3Body' },
] as const;

export function Welcome() {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const completeWelcome = usePreferencesStore((state) => state.completeWelcome);
  const listRef = useRef<FlatList>(null);
  const [active, setActive] = useState(0);
  const isLast = active === SLIDES.length - 1;

  const next = () => {
    if (isLast) {
      completeWelcome();
      return;
    }
    listRef.current?.scrollToIndex({ index: active + 1 });
    setActive(active + 1);
  };

  const features = [
    { icon: ShieldCheck, label: t('welcome.featureEscrow') },
    { icon: BadgeCheck, label: t('welcome.featureVerified') },
    { icon: ScanSearch, label: t('welcome.featureModerated') },
    { icon: Globe, label: t('welcome.featureAfrica') },
  ];

  return (
    <View className="flex-1 bg-night-950">
      <StatusBar style="light" />
      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        bounces={false}
        data={SLIDES}
        keyExtractor={(slide) => slide.key}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={(event) =>
          setActive(Math.round(event.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <Image
            source={item.image}
            contentFit="cover"
            style={{ width, height }}
            accessibilityIgnoresInvertColors
          />
        )}
      />

      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(6,11,38,0.7)',
          'rgba(6,11,38,0)',
          'rgba(6,11,38,0.15)',
          'rgba(6,11,38,0.92)',
          '#060b26',
        ]}
        locations={[0, 0.22, 0.4, 0.7, 1]}
        className="absolute inset-0"
      />

      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 flex-row items-center justify-center px-5"
        style={{ top: insets.top + 12 }}
      >
        <Image
          source={logoLight}
          className="h-8 w-[110px]"
          contentFit="contain"
          accessibilityLabel="Kega"
        />
        {!isLast ? (
          <Pressable
            accessibilityRole="button"
            onPress={completeWelcome}
            hitSlop={10}
            className="absolute right-5 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 active:opacity-70"
          >
            <Text variant="caption" tone="white" className="font-body-semibold">
              {t('welcome.skip')}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View
        pointerEvents="box-none"
        className="absolute bottom-0 left-0 right-0 px-6"
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
      >
        <Animated.View key={active} entering={FadeIn.duration(350)}>
          <Text className="font-heading-extrabold text-[40px] leading-[44px] tracking-tight text-white">
            {t(COPY[active].title)}
          </Text>
          <Text className="mt-4 max-w-[320px] text-[15px] leading-[22px] text-white/80">
            {t(COPY[active].body)}
          </Text>
        </Animated.View>

        <View className="mt-7 flex-row items-center justify-between">
          <View className="flex-row gap-1.5" accessibilityElementsHidden>
            {SLIDES.map((slide, index) => (
              <View
                key={slide.key}
                className={cn(
                  'h-1.5 rounded-full',
                  index === active ? 'w-7 bg-accent-400' : 'w-1.5 bg-white/40',
                )}
              />
            ))}
          </View>
          <Button
            title={isLast ? t('welcome.start') : t('welcome.next')}
            variant="light"
            size="lg"
            trailingIcon={ArrowRight}
            onPress={next}
          />
        </View>

        <View className="mt-8 flex-row border-t border-white/15 pt-5">
          {features.map(({ icon: Icon, label }) => (
            <View key={label} className="flex-1 items-center gap-1.5">
              <Icon size={20} color={palette.white} strokeWidth={1.75} />
              <Text variant="caption" className="text-[11px] text-white/75">
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
