import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { authHeaders } from '@/lib/api/client';
import { addressesApi, ordersApi } from '@/lib/api/endpoints';
import { API_URL } from '@/lib/config';
import { openHostedCheckout, payWithPaymentSheet } from '@/lib/payments';
import { queryKeys } from '@/lib/query/keys';
import { useAuthStore } from '@/stores/auth-store';
import type { Address, DeliveryAddressFields, Order, PaymentMethod } from '@/types/api';
import { isMobileMoney } from '@/utils/order-status';

const CONFIRMATION_ATTEMPTS = 10;
const CONFIRMATION_INTERVAL = 3000;
const MOBILE_MONEY_ATTEMPTS = 50;

export function useOrders() {
  const isSignedIn = useAuthStore((state) => state.token !== null);
  return useQuery({
    queryKey: queryKeys.orders.list(),
    queryFn: async ({ signal }) => (await ordersApi.mine({ signal })).data,
    enabled: isSignedIn,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: async ({ signal }) => (await ordersApi.show(id, { signal })).order,
  });
}

export function useAddresses(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.addresses(),
    queryFn: async ({ signal }) => (await addressesApi.list({ signal })).data,
    enabled,
  });
}

function useStoreOrder() {
  const queryClient = useQueryClient();
  return (order: Order) => {
    queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() });
  };
}

export function useCreateOrder() {
  const storeOrder = useStoreOrder();
  return useMutation({
    mutationFn: async (listingId: string) => (await ordersApi.create(listingId)).order,
    onSuccess: storeOrder,
  });
}

export function useSetDeliveryAddress(orderId: string) {
  const queryClient = useQueryClient();
  const storeOrder = useStoreOrder();
  return useMutation({
    mutationFn: async (body: { address_id: string } | DeliveryAddressFields) =>
      (await ordersApi.setDeliveryAddress(orderId, body)).order,
    onSuccess: (order) => {
      storeOrder(order);
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses() });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.remove(id),
    onSuccess: (_result, id) =>
      queryClient.setQueryData<Address[]>(queryKeys.addresses(), (addresses) =>
        addresses?.filter((address) => address.id !== id),
      ),
  });
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Card is paid in Stripe's native sheet, PayPal in a sheet that returns to the app by itself,
 * mobile money by approving the operator prompt on the phone. The payment is then confirmed,
 * polling while the gateway settles — longer for mobile money, where the buyer types a PIN.
 */
export function usePayOrder(orderId: string, billingName?: string) {
  const storeOrder = useStoreOrder();
  return useMutation({
    mutationFn: async ({ method, phone }: { method: PaymentMethod; phone?: string }) => {
      const result = await ordersApi.pay(orderId, method, phone);
      const { order } = result;
      const mobileMoney = isMobileMoney(method);

      if (result.client_secret && result.publishable_key) {
        const paid = await payWithPaymentSheet({
          clientSecret: result.client_secret,
          publishableKey: result.publishable_key,
          billingName,
        });
        if (!paid) return order;
      } else if (result.redirect_url) {
        await openHostedCheckout(result.redirect_url);
      } else if (!mobileMoney || order.status !== 'pending_payment') {
        return order;
      }

      const attempts = mobileMoney ? MOBILE_MONEY_ATTEMPTS : CONFIRMATION_ATTEMPTS;
      let current = order;
      for (let attempt = 0; attempt < attempts; attempt++) {
        if (attempt > 0 || mobileMoney) await wait(CONFIRMATION_INTERVAL);
        current = (await ordersApi.confirmPayment(orderId).catch(() => ({ order: current }))).order;
        if (current.status !== 'pending_payment') break;
      }
      return current;
    },
    onSuccess: storeOrder,
  });
}

export function useOrderAction(orderId: string) {
  const storeOrder = useStoreOrder();
  return useMutation({
    mutationFn: async (
      action:
        { type: 'confirm-receipt' } | { type: 'cancel' } | { type: 'dispute'; reason: string },
    ) => {
      switch (action.type) {
        case 'confirm-receipt':
          return (await ordersApi.confirmReceipt(orderId)).order;
        case 'cancel':
          return (await ordersApi.cancel(orderId)).order;
        case 'dispute':
          return (await ordersApi.dispute(orderId, action.reason)).order;
      }
    },
    onSuccess: storeOrder,
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: async (order: Pick<Order, 'id' | 'reference'>) => {
      const destination = new File(Paths.cache, `facture-${order.reference}.pdf`);
      const file = await File.downloadFileAsync(
        `${API_URL}${ordersApi.invoicePath(order.id)}`,
        destination,
        {
          headers: { ...authHeaders(), Accept: 'application/pdf' },
          idempotent: true,
        },
      );
      await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    },
  });
}
