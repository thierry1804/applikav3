import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Medication } from '@dogapp/types';
import { apiFetch } from '../services/api';
import { useAuthStore } from '../store/auth.store';

interface MedicationsResponse {
  data: Medication[];
}

function generateKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useMedications(dogId: string): {
  medications: Medication[];
  isLoading: boolean;
  isError: boolean;
} {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['medications', dogId],
    queryFn: () =>
      apiFetch<MedicationsResponse>(
        `/dogs/${dogId}/health/medications`,
        token ? { token } : undefined,
      ),
    enabled: Boolean(dogId && token),
  });
  return { medications: data?.data ?? [], isLoading, isError };
}

export function useConfirmDose(dogId: string): {
  mutate: (medId: string) => void;
  isPending: boolean;
} {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (medId: string) => {
      const opts: RequestInit & { token?: string } = {
        method: 'POST',
        headers: { 'Idempotency-Key': generateKey() },
      };
      if (token) opts.token = token;
      return apiFetch(`/dogs/${dogId}/health/medications/${medId}/doses`, opts);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['medications', dogId] });
    },
  });
  return { mutate, isPending };
}
