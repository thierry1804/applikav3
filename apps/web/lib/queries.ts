'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from './api';
import { useAuthStore } from './auth';

export interface Dog {
  id: string;
  name: string;
  breed: string | null;
  birthDate: string;
  sex: 'male' | 'female';
  sterilized: boolean;
  weightKg: number | null;
  photoUrl: string | null;
}

export interface Reminder {
  id: string;
  type: string;
  label: string;
  dueDate: string;
  recurrenceDays: number | null;
  lastDoneAt: string | null;
  isActive: boolean;
}

export interface WeightEntry {
  id: string;
  weightKg: number;
  measuredAt: string;
  note: string | null;
}

export interface HealthRecord {
  id: string;
  type: string;
  date: string;
  title: string;
  description: string | null;
  vetName: string | null;
}

interface PagedResponse<T> {
  data: T[];
  meta: { hasMore: boolean; nextCursor: string | null };
}

interface SingleResponse<T> {
  data: T;
}

function getOpts(token: string | null): RequestInit & { token?: string } {
  const opts: RequestInit & { token?: string } = {};
  if (token) opts.token = token;
  return opts;
}

export function useDogs(): UseQueryResult<PagedResponse<Dog>> {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['dogs'],
    queryFn: () => apiFetch<PagedResponse<Dog>>('/dogs', getOpts(token)),
    enabled: !!token,
  });
}

export function useDog(dogId: string): UseQueryResult<SingleResponse<Dog>> {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['dogs', dogId],
    queryFn: () => apiFetch<SingleResponse<Dog>>(`/dogs/${dogId}`, getOpts(token)),
    enabled: !!token,
  });
}

export function useDogReminders(dogId: string): UseQueryResult<PagedResponse<Reminder>> {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['dogs', dogId, 'reminders'],
    queryFn: () =>
      apiFetch<PagedResponse<Reminder>>(`/dogs/${dogId}/health/reminders`, getOpts(token)),
    enabled: !!token,
  });
}

export function useDogWeight(dogId: string): UseQueryResult<PagedResponse<WeightEntry>> {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['dogs', dogId, 'weight'],
    queryFn: () => apiFetch<PagedResponse<WeightEntry>>(`/dogs/${dogId}/weight`, getOpts(token)),
    enabled: !!token,
  });
}

export function useDogHealthRecords(dogId: string): UseQueryResult<PagedResponse<HealthRecord>> {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['dogs', dogId, 'health-records'],
    queryFn: () =>
      apiFetch<PagedResponse<HealthRecord>>(`/dogs/${dogId}/health/records`, getOpts(token)),
    enabled: !!token,
  });
}
