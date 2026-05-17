import { NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { mock } from 'jest-mock-extended';
import type { StorageService } from '../storage/storage.service';
import type { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

const baseUser = {
  id: 'user-1',
  email: 'a@b.com',
  name: 'Test',
  role: UserRole.owner,
  isBreeder: false,
  avatarUrl: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  passwordHash: 'x',
};

describe('UsersService', () => {
  let service: UsersService;
  const repository = mock<UsersRepository>();
  const storageService = mock<StorageService>();

  beforeEach(() => {
    service = new UsersService(repository, storageService);
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('throws NotFoundException when user not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.getMe('user-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException when user is deleted', async () => {
      repository.findById.mockResolvedValue({ ...baseUser, deletedAt: new Date() });
      await expect(service.getMe('user-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns AuthUser shape on success', async () => {
      repository.findById.mockResolvedValue(baseUser);
      const result = await service.getMe('user-1');
      expect(result).toMatchObject({ id: 'user-1', email: 'a@b.com', role: 'owner' });
    });
  });

  describe('updateMe', () => {
    it('updates and returns updated user', async () => {
      repository.update.mockResolvedValue(baseUser);
      repository.findById.mockResolvedValue({ ...baseUser, name: 'Updated' });
      const result = await service.updateMe('user-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('deleteAccount', () => {
    it('calls softDelete', async () => {
      repository.softDelete.mockResolvedValue(baseUser);
      await service.deleteAccount('user-1');
      expect(repository.softDelete).toHaveBeenCalledWith('user-1');
    });
  });

  describe('exportAccount', () => {
    it('throws NotFoundException when user missing', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.exportAccount('user-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns export data', async () => {
      repository.findById.mockResolvedValue(baseUser);
      const result = await service.exportAccount('user-1');
      expect(result.data).toHaveProperty('exportedAt');
    });
  });

  describe('getAvatarUploadUrl', () => {
    it('builds R2 key and returns signed URL', async () => {
      storageService.buildKey.mockReturnValue('dev/user-1/account/avatar/file.jpg');
      storageService.getUploadUrl.mockResolvedValue('https://r2.signed/url');
      const result = await service.getAvatarUploadUrl('user-1', 'file.jpg', 'image/jpeg');
      expect(result.uploadUrl).toBe('https://r2.signed/url');
      expect(result.key).toBe('dev/user-1/account/avatar/file.jpg');
    });
  });

  describe('confirmAvatar', () => {
    it('updates avatar url and returns user', async () => {
      storageService.getReadUrl.mockResolvedValue('https://r2.read/avatar.jpg');
      repository.update.mockResolvedValue(baseUser);
      repository.findById.mockResolvedValue({
        ...baseUser,
        avatarUrl: 'https://r2.read/avatar.jpg',
      });
      const result = await service.confirmAvatar('user-1', 'dev/user-1/avatar.jpg');
      expect(result.avatarUrl).toBe('https://r2.read/avatar.jpg');
    });
  });
});
