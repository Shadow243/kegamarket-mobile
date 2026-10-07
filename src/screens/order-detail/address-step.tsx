import { zodResolver } from '@hookform/resolvers/zod';
import { Check, MapPin, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/button';
import { FormMessage } from '@/components/form-message';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { useIsOnline } from '@/hooks/use-is-online';
import { useAddresses, useDeleteAddress, useSetDeliveryAddress } from '@/hooks/use-orders';
import { useCurrentUser } from '@/hooks/use-session';
import { useThemeColors } from '@/hooks/use-theme';
import { formLevelError, isApiError } from '@/lib/api/errors';
import { night } from '@/theme';
import type { Address } from '@/types/api';
import { cn } from '@/utils/cn';

import { useFormMessages } from '@/hooks/use-form-messages';
import { createAddressSchema, type AddressForm } from './address-schema';

function AddressOption({
  address,
  selected,
  onSelect,
  onDelete,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onSelect}
      className={cn(
        'flex-row items-start gap-3 rounded-2xl border-[1.5px] p-4',
        selected ? 'border-action bg-surface' : 'border-line bg-surface',
      )}
    >
      <View
        className={cn(
          'mt-0.5 h-5 w-5 items-center justify-center rounded-full border-[1.5px]',
          selected ? 'border-accent-400 bg-accent-400' : 'border-line-strong',
        )}
      >
        {selected ? <Check size={12} color={night[900]} strokeWidth={3} /> : null}
      </View>
      <View className="flex-1 gap-0.5">
        <Text variant="callout">{address.recipient_name}</Text>
        <Text variant="caption" tone="muted">
          {[address.delivery_address_line, address.delivery_commune, address.delivery_city]
            .filter(Boolean)
            .join(', ')}
        </Text>
        <Text variant="caption" tone="subtle">
          {address.recipient_phone}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('orders.deleteAddress')}
        hitSlop={10}
        onPress={onDelete}
      >
        <Trash2 size={18} color={colors['fg-subtle']} />
      </Pressable>
    </Pressable>
  );
}

export function AddressStep({ orderId }: { orderId: string }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isOnline = useIsOnline();
  const { user } = useCurrentUser();
  const messages = useFormMessages();
  const addresses = useAddresses(true);
  const setAddress = useSetDeliveryAddress(orderId);
  const deleteAddress = useDeleteAddress();

  const saved = addresses.data ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const selected = selectedId ?? saved[0]?.id ?? null;
  const showForm = addingNew || (addresses.isFetched && saved.length === 0);

  const { control, handleSubmit, formState } = useForm<AddressForm>({
    resolver: zodResolver(createAddressSchema(messages)),
    defaultValues: {
      recipient_name: user?.name ?? '',
      recipient_phone: user?.phone ?? '',
      recipient_email: user?.email ?? '',
      delivery_city: '',
      delivery_commune: '',
      delivery_address_line: '',
    },
  });

  const submit = () => {
    if (setAddress.isPending) return;
    if (!showForm && selected) {
      setAddress.mutate({ address_id: selected });
      return;
    }
    handleSubmit((values) => setAddress.mutate(values))();
  };

  const fieldError = (field: keyof AddressForm) =>
    formState.errors[field]?.message ??
    (isApiError(setAddress.error) ? setAddress.error.firstFieldError(field) : undefined);
  const generalError = formLevelError(
    setAddress.error,
    t('common.genericError'),
    t('common.networkError'),
  );

  const fields: {
    name: keyof AddressForm;
    label: string;
    keyboard?: 'phone-pad' | 'email-address';
  }[] = [
    { name: 'recipient_name', label: t('orders.recipientName') },
    { name: 'recipient_phone', label: t('orders.recipientPhone'), keyboard: 'phone-pad' },
    { name: 'recipient_email', label: t('orders.recipientEmail'), keyboard: 'email-address' },
    { name: 'delivery_city', label: t('orders.deliveryCity') },
    { name: 'delivery_commune', label: t('orders.deliveryCommune') },
    { name: 'delivery_address_line', label: t('orders.deliveryAddressLine') },
  ];

  return (
    <View>
      <View className="mb-4 flex-row items-center gap-2">
        <MapPin size={18} color={colors.fg} />
        <Text variant="headline">{t('orders.addressTitle')}</Text>
      </View>

      {!showForm ? (
        <View className="gap-2.5">
          {saved.map((address) => (
            <AddressOption
              key={address.id}
              address={address}
              selected={selected === address.id}
              onSelect={() => setSelectedId(address.id)}
              onDelete={() => deleteAddress.mutate(address.id)}
            />
          ))}
        </View>
      ) : (
        <View className="gap-4">
          {fields.map(({ name, label, keyboard }) => (
            <Controller
              key={name}
              control={control}
              name={name}
              render={({ field }) => (
                <TextField
                  label={label}
                  keyboardType={keyboard}
                  autoCapitalize={keyboard === 'email-address' ? 'none' : 'sentences'}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldError(name)}
                />
              )}
            />
          ))}
        </View>
      )}

      {saved.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setAddingNew((value) => !value)}
          className="mt-4 flex-row items-center gap-1.5 self-start active:opacity-60"
        >
          {!showForm ? <Plus size={16} color={colors.fg} /> : null}
          <Text variant="caption" className="font-body-bold text-fg underline">
            {showForm ? t('orders.useExistingAddress') : t('orders.addNewAddress')}
          </Text>
        </Pressable>
      ) : null}

      {generalError ? (
        <View className="mt-4">
          <FormMessage type="error" message={generalError} />
        </View>
      ) : null}

      <Button
        title={t('orders.addressSubmit')}
        size="lg"
        loading={setAddress.isPending}
        disabled={!isOnline || (!showForm && !selected)}
        onPress={submit}
        className="mt-6"
      />
    </View>
  );
}
