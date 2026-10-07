import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import type { ChannelAuthorizationCallback } from 'pusher-js/types/src/core/auth/options';

import { broadcastingApi } from '@/lib/api/endpoints';
import { REVERB } from '@/lib/config';

type ReverbEcho = Echo<'reverb'>;

let echo: ReverbEcho | null = null;

/** Shared Reverb connection; null when realtime isn't configured (the app then falls back to refetching). */
export function getEcho(): ReverbEcho | null {
  if (!REVERB.key || !REVERB.host) return null;
  if (echo) return echo;

  echo = new Echo({
    broadcaster: 'reverb',
    Pusher,
    key: REVERB.key,
    wsHost: REVERB.host,
    wsPort: REVERB.port,
    wssPort: REVERB.port,
    forceTLS: REVERB.scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    // Bearer-token API: private channels are authorized through our own client, not cookies.
    authorizer: (channel: { name: string }) => ({
      authorize: (socketId: string, callback: ChannelAuthorizationCallback) => {
        broadcastingApi
          .auth(socketId, channel.name)
          .then((data) => callback(null, data))
          .catch((error: Error) => callback(error, null));
      },
    }),
  });

  return echo;
}

export function disconnectEcho() {
  echo?.disconnect();
  echo = null;
}
