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
