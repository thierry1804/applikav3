import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { WeightLog } from '@dogapp/types';
import { apiFetch } from '../services/api';
import { useAuthStore } from '../store/auth.store';

interface WeightLogsResponse {
  data: WeightLog[];
  meta: { next_cursor: string | null; has_more: boolean };
}

function generateKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useWeightLogs(dogId: string): {
  logs: WeightLog[];
  isLoading: boolean;
  isError: boolean;
} {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['weight', dogId],
    queryFn: () =>
      apiFetch<WeightLogsResponse>(`/dogs/${dogId}/weight?limit=30`, token ? { token } : undefined),
    enabled: Boolean(dogId && token),
  });
  return { logs: data?.data ?? [], isLoading, isError };
}

export function useLogWeight(dogId: string): {
  mutate: (weightKg: number) => void;
  isPending: boolean;
} {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (weightKg: number) => {
      const now = new Date().toISOString();
      const opts: RequestInit & { token?: string } = {
        method: 'POST',
        body: JSON.stringify({ weightKg, weighedAt: now }),
        headers: { 'Idempotency-Key': generateKey() },
      };
      if (token) opts.token = token;
      return apiFetch(`/dogs/${dogId}/weight`, opts);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['weight', dogId] });
    },
  });
  return { mutate, isPending };
}
