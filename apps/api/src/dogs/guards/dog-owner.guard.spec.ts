import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import { DogOwnerGuard } from './dog-owner.guard';

function makeContext(params: Record<string, string>, userId = 'user-1'): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: userId }, params }),
    }),
  } as unknown as ExecutionContext;
}

const findFirst = jest.fn();
const prisma = { dog: { findFirst } } as unknown as InstanceType<typeof PrismaService>;

describe('DogOwnerGuard', () => {
  let guard: DogOwnerGuard;

  beforeEach(() => {
    guard = new DogOwnerGuard(prisma);
    jest.clearAllMocks();
  });

  it('returns true when no dogId in params', async () => {
    const result = await guard.canActivate(makeContext({}));
    expect(result).toBe(true);
  });

  it('throws NotFoundException when dog not found', async () => {
    findFirst.mockResolvedValue(null);
    await expect(guard.canActivate(makeContext({ dogId: 'dog-1' }))).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws ForbiddenException when dog belongs to different user', async () => {
    findFirst.mockResolvedValue({
      id: 'dog-1',
      ownerId: 'other-user',
    });
    await expect(
      guard.canActivate(makeContext({ dogId: 'dog-1' }, 'user-1')),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns true when dog belongs to user', async () => {
    findFirst.mockResolvedValue({ id: 'dog-1', ownerId: 'user-1' });
    const result = await guard.canActivate(makeContext({ dogId: 'dog-1' }, 'user-1'));
    expect(result).toBe(true);
  });

  it('uses id param as fallback when dogId not present', async () => {
    findFirst.mockResolvedValue({ id: 'dog-2', ownerId: 'user-1' });
    const result = await guard.canActivate(makeContext({ id: 'dog-2' }, 'user-1'));
    expect(result).toBe(true);
  });
});
