import { useQuery } from '@tanstack/react-query';

import { applicationsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import { useAuthStore } from '@/stores/auth-store';

export function useApplications() {
  const isSignedIn = useAuthStore((state) => state.token !== null);
  return useQuery({
    queryKey: queryKeys.applications(),
    queryFn: async ({ signal }) => (await applicationsApi.mine({ signal })).data,
    enabled: isSignedIn,
  });
}
