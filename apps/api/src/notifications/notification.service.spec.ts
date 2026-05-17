import type { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';

const baseDevice = {
  id: 'dev-1',
  userId: 'user-1',
  token: 'ExponentPushToken[xxx]',
  platform: 'ios',
  isValid: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('NotificationService', () => {
  let service: NotificationService;

  const tokenMock = {
    upsert: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
  };
  const prisma = { deviceToken: tokenMock } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
    tokenMock.upsert.mockResolvedValue(baseDevice);
    tokenMock.findMany.mockResolvedValue([baseDevice]);
    tokenMock.updateMany.mockResolvedValue({ count: 1 });
    service = new NotificationService(prisma);
  });

  describe('registerDeviceToken', () => {
    it('upserts token and returns device', async () => {
      const result = await service.registerDeviceToken('user-1', 'ExponentPushToken[xxx]', 'ios');

      expect(tokenMock.upsert).toHaveBeenCalledWith({
        where: { token: 'ExponentPushToken[xxx]' },
        update: { userId: 'user-1', platform: 'ios', isValid: true },
        create: { userId: 'user-1', token: 'ExponentPushToken[xxx]', platform: 'ios' },
      });
      expect(result.data).toMatchObject({ token: 'ExponentPushToken[xxx]' });
    });
  });

  describe('sendPush', () => {
    it('queries valid tokens for user', async () => {
      await service.sendPush('user-1', 'Rappel', 'Dans 1 jour');

      expect(tokenMock.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isValid: true },
      });
    });

    it('resolves without error when user has no tokens', async () => {
      tokenMock.findMany.mockResolvedValue([]);

      await expect(service.sendPush('user-1', 'Title', 'Body')).resolves.toBeUndefined();
    });
  });

  describe('invalidateToken', () => {
    it('sets isValid to false for given token', async () => {
      await service.invalidateToken('ExponentPushToken[xxx]');

      expect(tokenMock.updateMany).toHaveBeenCalledWith({
        where: { token: 'ExponentPushToken[xxx]' },
        data: { isValid: false },
      });
    });
  });
});
