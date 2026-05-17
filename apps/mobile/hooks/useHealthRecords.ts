import { useQuery } from '@tanstack/react-query';
import type { HealthRecord } from '@dogapp/types';
import { apiFetch } from '../services/api';
import { useAuthStore } from '../store/auth.store';

interface HealthRecordsResponse {
  data: HealthRecord[];
  meta: { next_cursor: string | null; has_more: boolean };
}

export function useHealthRecords(dogId: string): {
  records: HealthRecord[];
  isLoading: boolean;
  isError: boolean;
} {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health-records', dogId],
    queryFn: () =>
      apiFetch<HealthRecordsResponse>(
        `/dogs/${dogId}/health/records?limit=20`,
        token ? { token } : undefined,
      ),
    enabled: Boolean(dogId && token),
  });

  return {
    records: data?.data ?? [],
    isLoading,
    isError,
  };
}
