import { act, renderHook } from '@testing-library/react-native';

import { useDebouncedValue } from './use-debounced-value';

describe('useDebouncedValue', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('only publishes the last value once typing pauses', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'f' },
    });

    rerender({ value: 'fri' });
    rerender({ value: 'frigo' });
    expect(result.current).toBe('f');

    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe('frigo');
  });
});
