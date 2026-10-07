import type { Href } from 'expo-router';

/** Screen to open when a push is tapped; null for vendor-side pushes the app has no screen for. */
export function pushRoute(data: Record<string, unknown> | undefined): Href | null {
  const str = (key: string) => (typeof data?.[key] === 'string' ? (data[key] as string) : null);

  switch (str('type')) {
    case 'new_message': {
      const id = str('conversation_id');
      return id ? { pathname: '/conversation/[id]', params: { id } } : null;
    }
    case 'saved_search_match': {
      const slug = str('listing_slug');
      return slug ? { pathname: '/listing/[slug]', params: { slug } } : null;
    }
    case 'job_application_status_changed':
      return '/applications';
    default:
      return null;
  }
}
