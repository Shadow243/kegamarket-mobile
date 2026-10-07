// Mirrors the Laravel API resources (same shapes as lokole-client/app/types).

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface ShopSummary {
  id: string;
  name: string;
  owner_name: string | null;
}

export interface PublicListing {
  id: string;
  reference: string | null;
  title: string;
  localized_title: string;
  slug: string;
  price: string;
  compare_at_price: string | null;
  is_on_sale: boolean;
  discount_percent: number | null;
  currency: string;
  city: string;
  status: string;
  category_name: string;
  thumbnail_url: string | null;
  photos: { url: string }[];
  is_favorited: boolean;
  is_boosted: boolean;
  created_at: string;
  shop?: ShopSummary;
}

export interface ListingDetail {
  id: string;
  reference: string | null;
  title: string;
  localized_title: string;
  slug: string;
  localized_description: string;
  price: string;
  compare_at_price: string | null;
  is_on_sale: boolean;
  discount_percent: number | null;
  currency: string;
  city: string;
  commune: string | null;
  status: string;
  attributes: Record<string, string | number | boolean>;
  is_favorited: boolean;
  is_boosted: boolean;
  shop: {
    id: string;
    name: string;
    slug: string;
    verification_level: 'standard' | 'verified';
    logo_url: string | null;
    created_at: string;
    active_listings_count: number | null;
  };
  category: { id: string; name: string; slug: string };
  photos: { thumb_url: string; preview_url: string }[];
  created_at: string;
  published_at: string | null;
}

export interface ListingDetailResponse {
  listing: ListingDetail;
  contact_whatsapp_number: string | null;
}

export interface CategoryAttribute {
  id: string;
  key: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options: { value: string; label: string }[] | null;
  unit: string | null;
  label: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  attributes: CategoryAttribute[];
}

export interface CurrencyRates {
  base: string;
  rates: Record<string, number>;
}

export interface NotificationPreferences {
  new_messages: boolean;
  order_updates: boolean;
  application_replies: boolean;
  promotions: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  locale: string;
  verification_level: string;
  email_verified: boolean;
  phone_verified: boolean;
  roles: string[];
  notification_preferences: NotificationPreferences;
  avatar_url: string | null;
  cover_url: string | null;
  created_at: string;
}

export interface LoginPayload {
  login: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export type OrderStatus =
  'pending_payment' | 'paid_escrow' | 'completed' | 'cancelled' | 'disputed';
export type PaymentMethod = 'orange_money' | 'airtel_money' | 'mpesa' | 'card' | 'paypal' | 'cash';

export interface DeliveryAddressFields {
  recipient_name: string;
  recipient_phone: string;
  recipient_email: string;
  delivery_city: string;
  delivery_commune: string;
  delivery_address_line: string;
}

export interface Address {
  id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email: string | null;
  delivery_city: string;
  delivery_commune: string | null;
  delivery_address_line: string;
  created_at: string;
}

export interface Order {
  id: string;
  reference: string;
  status: OrderStatus;
  status_label: string;
  price: string;
  currency: string;
  payment_method: PaymentMethod | null;
  payment_method_label: string | null;
  paid_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  dispute_reason: string | null;
  disputed_at: string | null;
  created_at: string;
  has_delivery_address: boolean;
  delivery_address: { [K in keyof DeliveryAddressFields]: string | null };
  listing: { id: string; slug: string; title: string; thumbnail_url: string | null };
  shop: { id: string; name: string };
}

export interface SavedSearchFilters {
  search?: string;
  country?: string;
  city?: string | string[];
  category?: string;
  price_min?: string | number;
  price_max?: string | number;
  verified_only?: boolean;
}

export interface SavedSearch {
  id: string;
  name: string | null;
  filters: SavedSearchFilters;
  last_notified_at: string | null;
  created_at: string;
}

export type JobApplicationStatus = 'pending' | 'selected' | 'rejected';

export interface JobApplication {
  id: string;
  message: string | null;
  status: JobApplicationStatus;
  documents: { id: number; label: string; document_type: string | null; uploaded_at: string }[];
  created_at: string;
  job_posting?: { id: string; title: string; shop: { id: string; name: string } | null };
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar_url: string | null;
}

export interface Conversation {
  id: string;
  listing: { id: string; slug: string; title: string; thumbnail_url: string | null } | null;
  other_participant: ConversationParticipant | null;
  last_message: {
    body: string | null;
    sender_id: string;
    has_photos: boolean;
    is_share: boolean;
    created_at: string;
  } | null;
  unread_count: number;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  body: string | null;
  sender: ConversationParticipant;
  shared_listing: {
    id: string;
    slug: string;
    title: string;
    price: string;
    currency: string;
    thumbnail_url: string | null;
  } | null;
  shared_job_posting: { id: string; slug: string; title: string } | null;
  photos: { thumb_url: string; preview_url: string }[];
  reactions: { emoji: string; user_id: string }[];
  created_at: string;
}
