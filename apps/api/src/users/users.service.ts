import { Injectable, NotFoundException } from '@nestjs/common';
import type { AuthUser } from '@dogapp/types';
import { StorageService } from '../storage/storage.service';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly storageService: StorageService,
  ) {}

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.usersRepository.findById(userId);
    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as AuthUser['role'],
      isBreeder: user.isBreeder,
      avatarUrl: user.avatarUrl,
    };
  }

  async updateMe(userId: string, dto: { name?: string; isBreeder?: boolean }): Promise<AuthUser> {
    const user = await this.usersRepository.update(userId, dto);
    return this.getMe(user.id);
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.usersRepository.softDelete(userId);
  }

  async exportAccount(userId: string): Promise<{ data: Record<string, unknown> }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException();
    }
    return {
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        exportedAt: new Date().toISOString(),
      },
    };
  }

  async getAvatarUploadUrl(
    userId: string,
    fileName: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; key: string }> {
    const key = this.storageService.buildKey('dev', userId, 'account', 'avatar', fileName);
    const uploadUrl = await this.storageService.getUploadUrl(key, contentType);
    return { uploadUrl, key };
  }

  async confirmAvatar(userId: string, key: string): Promise<AuthUser> {
    const readUrl = await this.storageService.getReadUrl(key);
    await this.usersRepository.update(userId, { avatarUrl: readUrl });
    return this.getMe(userId);
  }
}
