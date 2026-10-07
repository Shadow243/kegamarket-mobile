import type { PublicListing } from '@/types/api';

import { formatPrice, formatTimeAgo } from './format';

export interface ListingCardModel {
  id: string;
  slug: string;
  title: string;
  price: string;
  convertedPrice?: string;
  oldPrice?: string;
  discount?: string;
  city: string;
  timeAgo: string;
  imageUrl: string | null;
  isBoosted: boolean;
  isFavorited: boolean;
}

export interface DisplayCurrency {
  code: string;
  convert: (amount: number, from: string) => number;
}

/** Same mapping as the web client's toListingCardData, so prices read identically on both. */
export function toListingCard(
  listing: PublicListing,
  locale: string,
  currency: DisplayCurrency,
): ListingCardModel {
  const amount = Number.parseFloat(listing.price);
  const onSale = listing.is_on_sale && listing.compare_at_price !== null;

  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.localized_title,
    price: formatPrice(amount, listing.currency, locale),
    convertedPrice:
      currency.code !== listing.currency
        ? formatPrice(currency.convert(amount, listing.currency), currency.code, locale)
        : undefined,
    oldPrice: onSale ? formatPrice(listing.compare_at_price!, listing.currency, locale) : undefined,
    discount: onSale && listing.discount_percent ? `-${listing.discount_percent}%` : undefined,
    city: listing.city,
    timeAgo: formatTimeAgo(listing.created_at, locale),
    imageUrl: listing.photos[0]?.url ?? listing.thumbnail_url,
    isBoosted: listing.is_boosted,
    isFavorited: listing.is_favorited,
  };
}
