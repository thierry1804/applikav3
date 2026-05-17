import { NotFoundException } from '@nestjs/common';
import { DogSex as PrismaDogSex } from '@prisma/client';
import { DogSex } from '@dogapp/types';
import { mock } from 'jest-mock-extended';
import type { StorageService } from '../storage/storage.service';
import type { DogsRepository } from './dogs.repository';
import { DogsService } from './dogs.service';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto';

const baseDog = {
  id: 'dog-1',
  ownerId: 'user-1',
  name: 'Rex',
  breed: 'Labrador',
  birthDate: new Date('2022-01-01'),
  sex: PrismaDogSex.male,
  sterilized: false,
  weightKg: null,
  lofNumber: null,
  lomadNumber: null,
  chipNumber: null,
  photoUrl: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const query: PaginationQueryDto = { limit: 20 };

describe('DogsService', () => {
  let service: DogsService;
  const repository = mock<DogsRepository>();
  const storageService = mock<StorageService>();

  beforeEach(() => {
    service = new DogsService(repository, storageService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated dogs', async () => {
      repository.findAllByOwner.mockResolvedValue([baseDog]);
      const result = await service.findAll('user-1', query);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({ name: 'Rex' });
      expect(result.meta.hasMore).toBe(false);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findOne('dog-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns dog when found', async () => {
      repository.findById.mockResolvedValue(baseDog);
      const result = await service.findOne('dog-1');
      expect(result.id).toBe('dog-1');
    });
  });

  describe('create', () => {
    it('creates and returns dog', async () => {
      repository.create.mockResolvedValue(baseDog);
      const result = await service.create('user-1', {
        name: 'Rex',
        breed: 'Labrador',
        birthDate: '2022-01-01',
        sex: DogSex.MALE,
      });
      expect(result.name).toBe('Rex');
    });
  });

  describe('update', () => {
    it('updates dog with provided fields', async () => {
      repository.update.mockResolvedValue({ ...baseDog, name: 'Max' });
      const result = await service.update('dog-1', { name: 'Max' });
      expect(result.name).toBe('Max');
    });
  });

  describe('remove', () => {
    it('calls softDelete', async () => {
      repository.softDelete.mockResolvedValue(baseDog);
      await service.remove('dog-1');
      expect(repository.softDelete).toHaveBeenCalledWith('dog-1');
    });
  });

  describe('getPhotoUploadUrl', () => {
    it('returns signed upload url', async () => {
      storageService.buildKey.mockReturnValue('dev/user-1/dog-1/photo/img.jpg');
      storageService.getUploadUrl.mockResolvedValue('https://r2/upload');
      const result = await service.getPhotoUploadUrl('user-1', 'dog-1', 'img.jpg', 'image/jpeg');
      expect(result.uploadUrl).toBe('https://r2/upload');
    });
  });

  describe('confirmPhoto', () => {
    it('updates photo url and returns dog', async () => {
      storageService.getReadUrl.mockResolvedValue('https://r2/photo.jpg');
      repository.update.mockResolvedValue({ ...baseDog, photoUrl: 'https://r2/photo.jpg' });
      const result = await service.confirmPhoto('dog-1', 'dev/user-1/dog-1/photo.jpg');
      expect(result.photoUrl).toBe('https://r2/photo.jpg');
    });
  });
});
