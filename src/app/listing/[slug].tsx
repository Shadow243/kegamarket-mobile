import { useLocalSearchParams } from 'expo-router';

import { ListingDetailScreen } from '@/screens/listing-detail';

export default function ListingRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <ListingDetailScreen slug={slug} />;
}
