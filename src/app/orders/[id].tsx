import { useLocalSearchParams } from 'expo-router';

import { OrderDetailScreen } from '@/screens/order-detail';

export default function OrderRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <OrderDetailScreen id={id} />;
}
