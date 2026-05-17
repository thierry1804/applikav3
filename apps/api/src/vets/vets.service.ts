import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { EnvConfig } from '../config/env.schema';
import { PrismaService } from '../prisma/prisma.service';

interface GooglePlaceResult {
  place_id: string;
  name: string;
  vicinity?: string;
  geometry: { location: { lat: number; lng: number } };
}

export interface VetPlace {
  placeId: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  distanceKm: number;
}

@Injectable()
export class VetsService implements OnModuleDestroy {
  private readonly logger = new Logger(VetsService.name);
  private readonly redis: Redis | null;

  constructor(
    private readonly config: ConfigService<EnvConfig, true>,
    private readonly prisma: PrismaService,
  ) {
    const url = config.get('REDIS_URL', { infer: true });
    this.redis = url ? new Redis(url) : null;
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis?.quit();
  }

  async searchNearby(lat: number, lng: number, radiusKm: number): Promise<{ data: VetPlace[] }> {
    const cacheKey = `vets:search:${lat.toFixed(4)}:${lng.toFixed(4)}:${radiusKm}`;
    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return { data: JSON.parse(cached) as VetPlace[] };
      }
    }

    const apiKey = this.config.get('GOOGLE_PLACES_API_KEY', { infer: true });
    let results: VetPlace[];

    if (apiKey) {
      try {
        results = await this.fetchGooglePlaces(lat, lng, radiusKm, apiKey);
      } catch (err) {
        this.logger.warn(`Google Places API error: ${String(err)}`);
        results = this.mockVets(lat, lng, radiusKm);
      }
    } else {
      results = this.mockVets(lat, lng, radiusKm);
    }

    if (this.redis) {
      await this.redis.setex(cacheKey, 86400, JSON.stringify(results));
    }

    return { data: results };
  }

  private async fetchGooglePlaces(
    lat: number,
    lng: number,
    radiusKm: number,
    apiKey: string,
  ): Promise<VetPlace[]> {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusKm * 1000}&type=veterinary_care&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { results: GooglePlaceResult[] };
    return json.results.map((p) => ({
      placeId: p.place_id,
      name: p.name,
      address: p.vicinity ?? '',
      phone: null,
      latitude: p.geometry.location.lat,
      longitude: p.geometry.location.lng,
      distanceKm: this.haversineKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng),
    }));
  }

  private mockVets(lat: number, lng: number, radiusKm: number): VetPlace[] {
    const mock: VetPlace[] = [
      {
        placeId: 'mock-vet-1',
        name: 'Clinique Vétérinaire du Parc',
        address: '12 rue des Lilas, Paris',
        phone: '+33123456789',
        latitude: lat + 0.01,
        longitude: lng + 0.01,
        distanceKm: 0.8,
      },
      {
        placeId: 'mock-vet-2',
        name: 'Cabinet Dr. Martin',
        address: '45 av. de la République, Paris',
        phone: '+33987654321',
        latitude: lat - 0.005,
        longitude: lng + 0.008,
        distanceKm: 1.2,
      },
    ].filter((v) => v.distanceKm <= radiusKm);
    return mock;
  }

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async listFavorites(userId: string): Promise<{ data: unknown[] }> {
    const favorites = await this.prisma.favoriteVet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: favorites };
  }

  async addFavorite(
    userId: string,
    dto: {
      placeId: string;
      name: string;
      address?: string;
      phone?: string;
      latitude: number;
      longitude: number;
    },
  ): Promise<{ data: unknown }> {
    const fav = await this.prisma.favoriteVet.create({
      data: {
        userId,
        placeId: dto.placeId,
        name: dto.name,
        address: dto.address ?? null,
        phone: dto.phone ?? null,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
    return { data: fav };
  }

  async removeFavorite(userId: string, placeId: string): Promise<void> {
    await this.prisma.favoriteVet.deleteMany({
      where: { userId, placeId },
    });
  }
}
