import type { Order, OrderStatus } from '@/types/api';

export type OrderFilter = 'all' | 'active' | 'completed' | 'disputed';

export const ORDER_FILTERS: OrderFilter[] = ['all', 'active', 'completed', 'disputed'];

export function matchesOrderFilter(order: Pick<Order, 'status'>, filter: OrderFilter): boolean {
  switch (filter) {
    case 'active':
      return order.status === 'pending_payment' || order.status === 'paid_escrow';
    case 'completed':
      return order.status === 'completed';
    case 'disputed':
      return order.status === 'disputed';
    default:
      return true;
  }
}

/** 1 = placed, 2 = paid into escrow, 3 = receipt confirmed; 0 when the order left the happy path. */
export function orderTrackerStep(status: OrderStatus): number {
  switch (status) {
    case 'pending_payment':
      return 1;
    case 'paid_escrow':
      return 2;
    case 'completed':
      return 3;
    default:
      return 0;
  }
}

export type StatusTone = 'warning' | 'brand' | 'success' | 'danger' | 'neutral';

export function orderStatusTone(status: OrderStatus): StatusTone {
  switch (status) {
    case 'pending_payment':
      return 'warning';
    case 'paid_escrow':
      return 'brand';
    case 'completed':
      return 'success';
    case 'disputed':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function isOrderActionable(status: OrderStatus): boolean {
  return status === 'pending_payment' || status === 'paid_escrow';
}
