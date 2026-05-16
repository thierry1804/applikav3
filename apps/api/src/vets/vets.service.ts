import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from '../config/env.schema';
import { PrismaService } from '../prisma/prisma.service';

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
export class VetsService {
  constructor(
    private readonly config: ConfigService<EnvConfig, true>,
    private readonly prisma: PrismaService,
  ) {}

  searchNearby(lat: number, lng: number, radiusKm: number): Promise<{ data: VetPlace[] }> {
    const apiKey = this.config.get('GOOGLE_PLACES_API_KEY', { infer: true });
    if (apiKey) {
      // TODO: call Google Places API + Redis cache 24h
    }
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
    return Promise.resolve({ data: mock });
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
