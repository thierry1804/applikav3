import { useMutation, useQuery } from '@tanstack/react-query';
import type { CheckupRecommendation } from '@dogapp/types';
import { apiFetch } from '../services/api';
import { useAuthStore } from '../store/auth.store';

interface CheckupQuestion {
  id: string;
  text: string;
  sortOrder: number;
}

interface QuestionsResponse {
  data: CheckupQuestion[];
}

interface CheckupResult {
  score: number;
  recommendation: CheckupRecommendation;
}

interface SubmitResponse {
  data: CheckupResult;
}

export function useCheckupQuestions(dogId: string): {
  questions: CheckupQuestion[];
  isLoading: boolean;
} {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading } = useQuery({
    queryKey: ['checkup-questions', dogId],
    queryFn: () =>
      apiFetch<QuestionsResponse>(
        `/dogs/${dogId}/checkup/questions`,
        token ? { token } : undefined,
      ),
    enabled: Boolean(dogId && token),
  });
  return { questions: data?.data ?? [], isLoading };
}

export function useSubmitCheckup(dogId: string): {
  mutate: (answers: Record<string, boolean>) => void;
  isPending: boolean;
  result: CheckupResult | null;
} {
  const token = useAuthStore((s) => s.token);
  const { mutate, isPending, data } = useMutation({
    mutationFn: (answers: Record<string, boolean>) => {
      const opts: RequestInit & { token?: string } = {
        method: 'POST',
        body: JSON.stringify({ answers }),
      };
      if (token) opts.token = token;
      return apiFetch<SubmitResponse>(`/dogs/${dogId}/checkup`, opts);
    },
  });
  return { mutate, isPending, result: data?.data ?? null };
}
