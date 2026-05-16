import { Module } from '@nestjs/common';
import { DogOwnerGuard } from './guards/dog-owner.guard';
import { DogsController } from './dogs.controller';
import { DogsRepository } from './dogs.repository';
import { DogsService } from './dogs.service';

@Module({
  controllers: [DogsController],
  providers: [DogsService, DogsRepository, DogOwnerGuard],
  exports: [DogsService, DogOwnerGuard],
})
export class DogsModule {}
