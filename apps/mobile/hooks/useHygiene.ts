import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { HygieneCare } from '@dogapp/types';
import { apiFetch } from '../services/api';
import { useAuthStore } from '../store/auth.store';

interface HygieneResponse {
  data: HygieneCare[];
}

export function useHygieneCares(dogId: string): {
  cares: HygieneCare[];
  isLoading: boolean;
  isError: boolean;
} {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['hygiene', dogId],
    queryFn: () =>
      apiFetch<HygieneResponse>(`/dogs/${dogId}/hygiene`, token ? { token } : undefined),
    enabled: Boolean(dogId && token),
  });
  return { cares: data?.data ?? [], isLoading, isError };
}

export function useMarkHygieneDone(dogId: string): {
  mutate: (id: string) => void;
  isPending: boolean;
} {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (id: string) => {
      const opts: RequestInit & { token?: string } = { method: 'PATCH' };
      if (token) opts.token = token;
      return apiFetch(`/dogs/${dogId}/hygiene/${id}/done`, opts);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['hygiene', dogId] });
    },
  });
  return { mutate, isPending };
}
