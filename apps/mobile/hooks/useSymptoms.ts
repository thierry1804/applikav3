import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SymptomLog } from '@dogapp/types';
import { apiFetch } from '../services/api';
import { useAuthStore } from '../store/auth.store';

interface SymptomsResponse {
  data: SymptomLog[];
  meta: { next_cursor: string | null; has_more: boolean };
}

interface CreateSymptomPayload {
  symptoms: string[];
  severity: number;
  notes?: string;
}

export function useSymptoms(dogId: string): {
  logs: SymptomLog[];
  isLoading: boolean;
  isError: boolean;
} {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['symptoms', dogId],
    queryFn: () =>
      apiFetch<SymptomsResponse>(
        `/dogs/${dogId}/health/symptoms?limit=30`,
        token ? { token } : undefined,
      ),
    enabled: Boolean(dogId && token),
  });
  return { logs: data?.data ?? [], isLoading, isError };
}

export function useCreateSymptom(dogId: string): {
  mutate: (payload: CreateSymptomPayload) => void;
  isPending: boolean;
} {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: CreateSymptomPayload) => {
      const opts: RequestInit & { token?: string } = {
        method: 'POST',
        body: JSON.stringify(payload),
      };
      if (token) opts.token = token;
      return apiFetch(`/dogs/${dogId}/health/symptoms`, opts);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['symptoms', dogId] });
    },
  });
  return { mutate, isPending };
}
