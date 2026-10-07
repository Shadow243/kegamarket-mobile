import { pushRoute } from './push-route';

describe('pushRoute', () => {
  it('opens the conversation of a new message', () => {
    expect(pushRoute({ type: 'new_message', conversation_id: 'c1' })).toEqual({
      pathname: '/conversation/[id]',
      params: { id: 'c1' },
    });
  });

  it('opens the listing of a saved search match', () => {
    expect(pushRoute({ type: 'saved_search_match', listing_slug: 'frigo-lg' })).toEqual({
      pathname: '/listing/[slug]',
      params: { slug: 'frigo-lg' },
    });
  });

  it('opens applications when an application status changes', () => {
    expect(pushRoute({ type: 'job_application_status_changed' })).toBe('/applications');
  });

  it('ignores vendor pushes, unknown types and missing ids', () => {
    expect(pushRoute({ type: 'shop_verified', shop_id: 's1' })).toBeNull();
    expect(pushRoute({ type: 'new_message' })).toBeNull();
    expect(pushRoute(undefined)).toBeNull();
  });
});
