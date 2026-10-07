import type { OrderStatus } from '@/types/api';

import { matchesOrderFilter, orderStatusTone, orderTrackerStep } from './order-status';

const order = (status: OrderStatus) => ({ status });

describe('matchesOrderFilter', () => {
  it('groups pending and escrowed orders as active', () => {
    expect(matchesOrderFilter(order('pending_payment'), 'active')).toBe(true);
    expect(matchesOrderFilter(order('paid_escrow'), 'active')).toBe(true);
    expect(matchesOrderFilter(order('disputed'), 'active')).toBe(false);
  });

  it('matches completed and disputed exactly, and everything for all', () => {
    expect(matchesOrderFilter(order('completed'), 'completed')).toBe(true);
    expect(matchesOrderFilter(order('disputed'), 'disputed')).toBe(true);
    expect(matchesOrderFilter(order('cancelled'), 'all')).toBe(true);
  });
});

describe('orderTrackerStep', () => {
  it('follows the escrow happy path', () => {
    expect(orderTrackerStep('pending_payment')).toBe(1);
    expect(orderTrackerStep('paid_escrow')).toBe(2);
    expect(orderTrackerStep('completed')).toBe(3);
  });

  it('has no step for cancelled or disputed orders', () => {
    expect(orderTrackerStep('cancelled')).toBe(0);
    expect(orderTrackerStep('disputed')).toBe(0);
  });
});

describe('orderStatusTone', () => {
  it('maps each status to a badge tone', () => {
    expect(orderStatusTone('pending_payment')).toBe('warning');
    expect(orderStatusTone('paid_escrow')).toBe('brand');
    expect(orderStatusTone('completed')).toBe('success');
    expect(orderStatusTone('disputed')).toBe('danger');
    expect(orderStatusTone('cancelled')).toBe('neutral');
  });
});
