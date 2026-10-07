import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ArrowUp, ImagePlus, Link2, X } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { night } from '@/theme';
import type { OutgoingMessage, OutgoingPhoto } from '@/lib/api/endpoints';
import { cn } from '@/utils/cn';

const MAX_PHOTOS = 5;

export function Composer({
  placeholder,
  onSend,
  onShareListing,
  allowAttachments = true,
}: {
  placeholder: string;
  onSend: (message: OutgoingMessage) => Promise<boolean>;
  onShareListing?: () => void;
  allowAttachments?: boolean;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<OutgoingPhoto[]>([]);
  const canSend = text.trim().length > 0 || photos.length > 0;

  const pickPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('messages.addPhoto'), t('messages.photoPermission'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.7,
    });
    if (result.canceled) return;
    setPhotos((current) =>
      [
        ...current,
        ...result.assets.map((asset, index) => ({
          uri: asset.uri,
          name: asset.fileName ?? `photo-${Date.now()}-${index}.jpg`,
          type: asset.mimeType ?? 'image/jpeg',
        })),
      ].slice(0, MAX_PHOTOS),
    );
  };

  const send = async () => {
    if (!canSend) return;
    const draft = { body: text.trim() || undefined, photos: photos.length ? photos : undefined };
    setText('');
    setPhotos([]);
    const sent = await onSend(draft);
    if (!sent) {
      setText(draft.body ?? '');
      setPhotos(draft.photos ?? []);
    }
  };

  return (
    <View className="border-t border-line bg-canvas px-3 pb-2 pt-2.5">
      {photos.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-1 pb-2.5"
        >
          {photos.map((photo) => (
            <View key={photo.uri}>
              <Image source={photo.uri} className="h-16 w-16 rounded-xl" contentFit="cover" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                onPress={() =>
                  setPhotos((current) => current.filter((item) => item.uri !== photo.uri))
                }
                className="absolute -right-1.5 -top-1.5 h-6 w-6 items-center justify-center rounded-full bg-action"
              >
                <X size={12} color={colors['on-action']} strokeWidth={3} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : null}

      <View className="flex-row items-end gap-2">
        {allowAttachments ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('messages.addPhoto')}
              disabled={photos.length >= MAX_PHOTOS}
              onPress={pickPhotos}
              className="h-11 w-11 items-center justify-center rounded-full bg-surface-muted active:opacity-70"
            >
              <ImagePlus size={20} color={colors.fg} />
            </Pressable>
            {onShareListing ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('messages.shareListing')}
                onPress={onShareListing}
                className="h-11 w-11 items-center justify-center rounded-full bg-surface-muted active:opacity-70"
              >
                <Link2 size={20} color={colors.fg} />
              </Pressable>
            ) : null}
          </>
        ) : null}

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors['fg-subtle']}
          selectionColor={colors.brand}
          multiline
          maxLength={4000}
          accessibilityLabel={placeholder}
          className="max-h-32 min-h-11 flex-1 rounded-[22px] bg-surface-muted px-4 pb-3 pt-3 font-body text-[15px] text-fg"
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('messages.send')}
          accessibilityState={{ disabled: !canSend }}
          disabled={!canSend}
          onPress={send}
          className={cn(
            'h-11 w-11 items-center justify-center rounded-full',
            canSend ? 'bg-accent-400' : 'bg-surface-muted',
          )}
        >
          <ArrowUp size={20} color={canSend ? night[900] : colors['fg-subtle']} strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
}
