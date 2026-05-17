import type { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { PrismaService } from '../prisma/prisma.service';
import { VetsService } from './vets.service';

jest.mock('ioredis');

const MockedRedis = Redis as jest.MockedClass<typeof Redis>;

const baseFav = {
  id: 'fav-1',
  userId: 'user-1',
  placeId: 'place-1',
  name: 'Clinique du Parc',
  address: '12 rue des Lilas',
  phone: null,
  latitude: 48.85,
  longitude: 2.35,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('VetsService', () => {
  let service: VetsService;
  let redisMock: { get: jest.Mock; setex: jest.Mock; quit: jest.Mock };
  let configGet: jest.Mock;

  const favMock = {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  };
  const prisma = { favoriteVet: favMock } as unknown as PrismaService;

  const makeConfig = (withRedis: boolean, apiKey?: string): void => {
    configGet.mockImplementation((key: string) => {
      if (key === 'REDIS_URL') return withRedis ? 'redis://localhost:6379' : undefined;
      if (key === 'GOOGLE_PLACES_API_KEY') return apiKey;
      return undefined;
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    redisMock = {
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue('OK'),
      quit: jest.fn().mockResolvedValue('OK'),
    };
    MockedRedis.mockImplementation(() => redisMock as unknown as Redis);

    configGet = jest.fn();
    const configService = { get: configGet } as unknown as ConfigService<
      Record<string, unknown>,
      true
    >;

    makeConfig(true);
    service = new VetsService(configService, prisma);

    favMock.findMany.mockResolvedValue([baseFav]);
    favMock.create.mockResolvedValue(baseFav);
    favMock.deleteMany.mockResolvedValue({ count: 1 });
  });

  describe('searchNearby', () => {
    it('returns cached data on Redis hit without calling setex', async () => {
      const cached = [
        {
          placeId: 'cached-1',
          name: 'Cached Vet',
          address: '',
          phone: null,
          latitude: 48.86,
          longitude: 2.36,
          distanceKm: 0.5,
        },
      ];
      redisMock.get.mockResolvedValue(JSON.stringify(cached));

      const result = await service.searchNearby(48.85, 2.35, 5);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.name).toBe('Cached Vet');
      expect(redisMock.setex).not.toHaveBeenCalled();
    });

    it('returns mock vets and caches when no API key', async () => {
      const result = await service.searchNearby(48.85, 2.35, 5);

      expect(result.data.length).toBeGreaterThan(0);
      expect(redisMock.setex).toHaveBeenCalledTimes(1);
      const [, ttl] = redisMock.setex.mock.calls[0] as [string, number, string];
      expect(ttl).toBe(86400);
    });

    it('filters mock vets exceeding radius', async () => {
      const result = await service.searchNearby(48.85, 2.35, 1.0);

      expect(result.data.every((v) => v.distanceKm <= 1.0)).toBe(true);
    });

    it('works without Redis (no cache read or write)', async () => {
      makeConfig(false);
      const configService = { get: configGet } as unknown as ConfigService<
        Record<string, unknown>,
        true
      >;
      service = new VetsService(configService, prisma);

      const result = await service.searchNearby(48.85, 2.35, 5);

      expect(result.data).toBeDefined();
      expect(redisMock.get).not.toHaveBeenCalled();
      expect(redisMock.setex).not.toHaveBeenCalled();
    });
  });

  describe('listFavorites', () => {
    it('returns favorites ordered by createdAt desc', async () => {
      const result = await service.listFavorites('user-1');

      expect(favMock.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('addFavorite', () => {
    it('creates and returns favorite', async () => {
      const result = await service.addFavorite('user-1', {
        placeId: 'place-1',
        name: 'Clinique du Parc',
        latitude: 48.85,
        longitude: 2.35,
      });

      expect(favMock.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: 'user-1', placeId: 'place-1' }),
      });
      expect(result.data).toMatchObject({ placeId: 'place-1' });
    });
  });

  describe('removeFavorite', () => {
    it('calls deleteMany with userId and placeId', async () => {
      await service.removeFavorite('user-1', 'place-1');

      expect(favMock.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', placeId: 'place-1' },
      });
    });
  });

  describe('onModuleDestroy', () => {
    it('quits Redis connection', async () => {
      await service.onModuleDestroy();

      expect(redisMock.quit).toHaveBeenCalled();
    });
  });
});
