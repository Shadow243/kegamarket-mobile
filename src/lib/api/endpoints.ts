import type {
  Address,
  AuthUser,
  Category,
  Conversation,
  CurrencyRates,
  DeliveryAddressFields,
  JobApplication,
  ListingDetailResponse,
  LoginPayload,
  LoginResponse,
  Message,
  NotificationPreferences,
  Order,
  Paginated,
  PaymentMethod,
  PublicListing,
  SavedSearch,
  SavedSearchFilters,
} from '@/types/api';

import { request } from './client';

export type ListingSort = 'newest' | 'price_asc' | 'price_desc' | 'most_viewed';

export interface ListingFilters {
  search?: string;
  category?: string;
  city?: string;
  sort?: ListingSort;
  on_sale?: boolean;
  viewer_country?: string;
}

type Signal = { signal?: AbortSignal };

export const listingsApi = {
  list: (filters: ListingFilters & { page?: number }, { signal }: Signal = {}) =>
    request<Paginated<PublicListing>>('/listings', {
      query: { ...filters, on_sale: filters.on_sale ? 1 : undefined },
      signal,
    }),
  bySlug: (slug: string, { signal }: Signal = {}) =>
    request<ListingDetailResponse>(`/listings/slug/${encodeURIComponent(slug)}`, { signal }),
  favorites: (page: number, { signal }: Signal = {}) =>
    request<Paginated<PublicListing>>('/listings/favorites/mine', { query: { page }, signal }),
  toggleFavorite: (listingId: string) =>
    request<{ favorited: boolean }>(`/listings/${listingId}/favorite`, { method: 'POST' }),
};

export const catalogApi = {
  categories: ({ signal }: Signal = {}) => request<{ data: Category[] }>('/categories', { signal }),
  currencies: ({ signal }: Signal = {}) => request<CurrencyRates>('/currencies', { signal }),
  detectCountry: ({ signal }: Signal = {}) =>
    request<{ iso2: string | null }>('/countries/detect', { signal }),
};

export const authApi = {
  login: (payload: LoginPayload) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: payload }),
  me: ({ signal }: Signal = {}) => request<AuthUser>('/auth/me', { signal }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
};

export interface ProfilePayload {
  name: string;
  email: string;
  phone: string;
  locale: string;
}

export interface PasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

type UserResponse = { user: AuthUser };

export const profileApi = {
  update: (payload: ProfilePayload) =>
    request<UserResponse>('/profile', { method: 'PATCH', body: payload }),
  updatePassword: (payload: PasswordPayload) =>
    request<{ message: string }>('/profile/password', { method: 'PUT', body: payload }),
  updateAvatar: (form: FormData) =>
    request<UserResponse>('/profile/avatar', { method: 'POST', body: form }),
  updateNotifications: (preferences: Partial<NotificationPreferences>) =>
    request<UserResponse>('/profile/notifications', { method: 'PATCH', body: preferences }),
  updateLocale: (locale: string) =>
    request<UserResponse>('/profile/locale', { method: 'PATCH', body: { locale } }),
};

type OrderResponse = { order: Order };

export const ordersApi = {
  mine: ({ signal }: Signal = {}) => request<{ data: Order[] }>('/orders/mine', { signal }),
  show: (id: string, { signal }: Signal = {}) =>
    request<OrderResponse>(`/orders/${id}`, { signal }),
  create: (listingId: string) =>
    request<OrderResponse>('/orders', { method: 'POST', body: { listing_id: listingId } }),
  setDeliveryAddress: (id: string, body: { address_id: string } | DeliveryAddressFields) =>
    request<OrderResponse>(`/orders/${id}/delivery-address`, { method: 'POST', body }),
  pay: (id: string, paymentMethod: PaymentMethod) =>
    request<OrderResponse & { redirect_url: string | null }>(`/orders/${id}/pay`, {
      method: 'POST',
      body: { payment_method: paymentMethod },
    }),
  confirmPayment: (id: string) =>
    request<OrderResponse>(`/orders/${id}/confirm-payment`, { method: 'POST' }),
  confirmReceipt: (id: string) =>
    request<OrderResponse>(`/orders/${id}/confirm-receipt`, { method: 'POST' }),
  cancel: (id: string) => request<OrderResponse>(`/orders/${id}/cancel`, { method: 'POST' }),
  dispute: (id: string, reason: string) =>
    request<OrderResponse>(`/orders/${id}/dispute`, { method: 'POST', body: { reason } }),
  invoicePath: (id: string) => `/orders/${id}/invoice`,
};

export const addressesApi = {
  list: ({ signal }: Signal = {}) => request<{ data: Address[] }>('/addresses', { signal }),
  remove: (id: string) => request<void>(`/addresses/${id}`, { method: 'DELETE' }),
};

export const savedSearchesApi = {
  list: ({ signal }: Signal = {}) =>
    request<{ data: SavedSearch[] }>('/saved-searches', { signal }),
  create: (filters: SavedSearchFilters, name?: string) =>
    request<{ saved_search: SavedSearch }>('/saved-searches', {
      method: 'POST',
      body: { name: name || undefined, filters },
    }),
  remove: (id: string) => request<void>(`/saved-searches/${id}`, { method: 'DELETE' }),
};

export const applicationsApi = {
  mine: ({ signal }: Signal = {}) =>
    request<{ data: JobApplication[] }>('/jobs/applications/mine', { signal }),
};

export interface OutgoingPhoto {
  uri: string;
  name: string;
  type: string;
}

export interface OutgoingMessage {
  body?: string;
  sharedListingId?: string;
  photos?: OutgoingPhoto[];
}

export const conversationsApi = {
  list: ({ signal }: Signal = {}) =>
    request<{ data: Conversation[]; meta: { unread_total: number } }>('/conversations', { signal }),
  start: (listingId: string) =>
    request<{ conversation: Conversation }>('/conversations', {
      method: 'POST',
      body: { listing_id: listingId },
    }),
  messages: (id: string, page: number, { signal }: Signal = {}) =>
    request<Paginated<Message>>(`/conversations/${id}/messages`, { query: { page }, signal }),
  send: (id: string, message: OutgoingMessage) => {
    const form = new FormData();
    if (message.body) form.append('body', message.body);
    if (message.sharedListingId) form.append('shared_listing_id', message.sharedListingId);
    message.photos?.forEach((photo) => form.append('photos[]', photo as never));
    return request<{ message: Message }>(`/conversations/${id}/messages`, {
      method: 'POST',
      body: form,
    });
  },
  toggleReaction: (id: string, messageId: string, emoji: string) =>
    request<{ message: Message }>(`/conversations/${id}/messages/${messageId}/reactions`, {
      method: 'POST',
      body: { emoji },
    }),
  remove: (id: string, messageId: string) =>
    request<void>(`/conversations/${id}/messages/${messageId}`, { method: 'DELETE' }),
  markRead: (id: string) => request<void>(`/conversations/${id}/read`, { method: 'POST' }),
  support: ({ signal }: Signal = {}) =>
    request<{ conversation: Conversation }>('/support/chat', { signal }),
};

export const devicesApi = {
  register: (token: string, platform: 'ios' | 'android') =>
    request<void>('/devices', { method: 'POST', body: { token, platform } }),
  unregister: (token: string) => request<void>('/devices', { method: 'DELETE', body: { token } }),
};

export const broadcastingApi = {
  auth: (socketId: string, channelName: string) =>
    request<{ auth: string; channel_data?: string }>('/broadcasting/auth', {
      method: 'POST',
      body: { socket_id: socketId, channel_name: channelName },
    }),
};
