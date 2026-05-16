import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthUser } from '@dogapp/types';
import { PrismaService } from '../../prisma/prisma.service';

interface RequestWithUser {
  user: AuthUser;
  params: { dogId?: string; id?: string };
}

@Injectable()
export class DogOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const dogId = request.params.dogId ?? request.params.id;
    if (!dogId) {
      return true;
    }

    const dog = await this.prisma.dog.findFirst({
      where: { id: dogId, deletedAt: null },
    });

    if (!dog) {
      throw new NotFoundException('Dog not found');
    }

    if (dog.ownerId !== request.user.id) {
      throw new ForbiddenException('You do not own this dog');
    }

    return true;
  }
}
