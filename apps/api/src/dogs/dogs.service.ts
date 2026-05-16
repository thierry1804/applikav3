import { Injectable, NotFoundException } from '@nestjs/common';
import type { Dog as DogType } from '@dogapp/types';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { sliceForPagination, toPaginatedMeta } from '../common/utils/response.util';
import { StorageService } from '../storage/storage.service';
import { CreateDogDto } from './dto/create-dog.dto';
import { UpdateDogDto } from './dto/update-dog.dto';
import { DogsRepository } from './dogs.repository';
import type { Dog } from '@prisma/client';

@Injectable()
export class DogsService {
  constructor(
    private readonly dogsRepository: DogsRepository,
    private readonly storageService: StorageService,
  ) {}

  async findAll(
    ownerId: string,
    query: PaginationQueryDto,
  ): Promise<{ data: DogType[]; meta: ReturnType<typeof toPaginatedMeta> }> {
    const records = await this.dogsRepository.findAllByOwner(ownerId, query);
    const paginated = sliceForPagination(records, query.limit);
    return {
      data: paginated.data.map((d) => this.toResponse(d)),
      meta: toPaginatedMeta(paginated, query.limit),
    };
  }

  async findOne(dogId: string): Promise<DogType> {
    const dog = await this.dogsRepository.findById(dogId);
    if (!dog) {
      throw new NotFoundException('Dog not found');
    }
    return this.toResponse(dog);
  }

  async create(ownerId: string, dto: CreateDogDto): Promise<DogType> {
    const dog = await this.dogsRepository.create({
      name: dto.name,
      breed: dto.breed,
      birthDate: new Date(dto.birthDate),
      sex: dto.sex,
      sterilized: dto.sterilized ?? false,
      weightKg: dto.weightKg ?? null,
      lofNumber: dto.lofNumber ?? null,
      lomadNumber: dto.lomadNumber ?? null,
      chipNumber: dto.chipNumber ?? null,
      owner: { connect: { id: ownerId } },
    });
    return this.toResponse(dog);
  }

  async update(dogId: string, dto: UpdateDogDto): Promise<DogType> {
    const dog = await this.dogsRepository.update(dogId, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.breed !== undefined && { breed: dto.breed }),
      ...(dto.birthDate !== undefined && { birthDate: new Date(dto.birthDate) }),
      ...(dto.sex !== undefined && { sex: dto.sex }),
      ...(dto.sterilized !== undefined && { sterilized: dto.sterilized }),
      ...(dto.weightKg !== undefined && { weightKg: dto.weightKg }),
      ...(dto.lofNumber !== undefined && { lofNumber: dto.lofNumber }),
      ...(dto.lomadNumber !== undefined && { lomadNumber: dto.lomadNumber }),
      ...(dto.chipNumber !== undefined && { chipNumber: dto.chipNumber }),
    });
    return this.toResponse(dog);
  }

  async remove(dogId: string): Promise<void> {
    await this.dogsRepository.softDelete(dogId);
  }

  async getPhotoUploadUrl(
    ownerId: string,
    dogId: string,
    fileName: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; key: string }> {
    const key = this.storageService.buildKey('dev', ownerId, dogId, 'photo', fileName);
    const uploadUrl = await this.storageService.getUploadUrl(key, contentType);
    return { uploadUrl, key };
  }

  async confirmPhoto(dogId: string, key: string): Promise<DogType> {
    const readUrl = await this.storageService.getReadUrl(key);
    const dog = await this.dogsRepository.update(dogId, { photoUrl: readUrl });
    return this.toResponse(dog);
  }

  private toResponse(dog: Dog): DogType {
    return {
      id: dog.id,
      ownerId: dog.ownerId,
      name: dog.name,
      breed: dog.breed,
      birthDate: dog.birthDate.toISOString().slice(0, 10),
      sex: dog.sex as DogType['sex'],
      sterilized: dog.sterilized,
      weightKg: dog.weightKg ? Number(dog.weightKg) : null,
      lofNumber: dog.lofNumber,
      lomadNumber: dog.lomadNumber,
      chipNumber: dog.chipNumber,
      photoUrl: dog.photoUrl,
      createdAt: dog.createdAt.toISOString(),
      updatedAt: dog.updatedAt.toISOString(),
    };
  }
}
