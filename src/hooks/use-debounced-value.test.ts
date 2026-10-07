import { act, renderHook } from '@testing-library/react-native';

import { useDebouncedValue } from './use-debounced-value';

describe('useDebouncedValue', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('only publishes the last value once typing pauses', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'f' } },
    );

    await rerender({ value: 'fri' });
    await rerender({ value: 'frigo' });
    expect(result.current).toBe('f');

    await act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe('frigo');
  });
});
