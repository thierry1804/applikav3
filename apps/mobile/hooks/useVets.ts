import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../services/api';
import { useAuthStore } from '../store/auth.store';

export interface VetPlace {
  placeId: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  distanceKm: number;
}

interface FavoriteVet {
  id: string;
  placeId: string;
  name: string;
  address: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
}

interface SearchResponse {
  data: VetPlace[];
}

interface FavoritesResponse {
  data: FavoriteVet[];
}

export function useVetSearch(
  lat: number | null,
  lng: number | null,
): {
  vets: VetPlace[];
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ['vets', lat, lng],
    queryFn: () => apiFetch<SearchResponse>(`/vets?lat=${lat}&lng=${lng}&radius=5`),
    enabled: lat !== null && lng !== null,
  });
  return { vets: data?.data ?? [], isLoading };
}

export function useFavoriteVets(): {
  favorites: FavoriteVet[];
  isLoading: boolean;
} {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading } = useQuery({
    queryKey: ['favorite-vets'],
    queryFn: () =>
      apiFetch<FavoritesResponse>('/account/favorite-vets', token ? { token } : undefined),
    enabled: Boolean(token),
  });
  return { favorites: data?.data ?? [], isLoading };
}

export function useAddFavoriteVet(): {
  mutate: (vet: Omit<VetPlace, 'distanceKm'>) => void;
  isPending: boolean;
} {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (vet: Omit<VetPlace, 'distanceKm'>) => {
      const opts: RequestInit & { token?: string } = {
        method: 'POST',
        body: JSON.stringify(vet),
      };
      if (token) opts.token = token;
      return apiFetch('/account/favorite-vets', opts);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['favorite-vets'] });
    },
  });
  return { mutate, isPending };
}

export function useRemoveFavoriteVet(): {
  mutate: (placeId: string) => void;
} {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (placeId: string) => {
      const opts: RequestInit & { token?: string } = { method: 'DELETE' };
      if (token) opts.token = token;
      return apiFetch(`/account/favorite-vets/${placeId}`, opts);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['favorite-vets'] });
    },
  });
  return { mutate };
}
