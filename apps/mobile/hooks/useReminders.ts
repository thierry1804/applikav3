import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Reminder } from '@dogapp/types';
import { apiFetch } from '../services/api';
import { useAuthStore } from '../store/auth.store';

interface RemindersResponse {
  data: Reminder[];
  meta: { next_cursor: string | null; has_more: boolean };
}

function generateKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useReminders(dogId: string): {
  reminders: Reminder[];
  isLoading: boolean;
  isError: boolean;
} {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reminders', dogId],
    queryFn: () =>
      apiFetch<RemindersResponse>(
        `/dogs/${dogId}/health/reminders?limit=50`,
        token ? { token } : undefined,
      ),
    enabled: Boolean(dogId && token),
  });
  return { reminders: data?.data ?? [], isLoading, isError };
}

export function useMarkReminderDone(dogId: string): {
  mutate: (remId: string) => void;
  isPending: boolean;
} {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (remId: string) => {
      const opts: RequestInit & { token?: string } = {
        method: 'PATCH',
        headers: { 'Idempotency-Key': generateKey() },
      };
      if (token) opts.token = token;
      return apiFetch(`/dogs/${dogId}/health/reminders/${remId}/done`, opts);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reminders', dogId] });
    },
  });
  return { mutate, isPending };
}
