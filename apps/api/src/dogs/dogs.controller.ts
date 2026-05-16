import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import type { AuthUser } from '@dogapp/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateDogDto } from './dto/create-dog.dto';
import { UpdateDogDto } from './dto/update-dog.dto';
import { DogOwnerGuard } from './guards/dog-owner.guard';
import { DogsService } from './dogs.service';

@ApiTags('dogs')
@Controller('dogs')
@UseGuards(JwtAuthGuard)
export class DogsController {
  constructor(private readonly dogsService: DogsService) {}

  @Get()
  @ApiOperation({ summary: 'List dogs for current user' })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ): Promise<unknown> {
    return this.dogsService.findAll(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a dog' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateDogDto,
  ): Promise<{ data: unknown }> {
    const data = await this.dogsService.create(user.id, dto);
    return { data };
  }

  @Get(':id')
  @UseGuards(DogOwnerGuard)
  @ApiOperation({ summary: 'Get dog by id' })
  async findOne(@Param('id') id: string): Promise<{ data: unknown }> {
    const data = await this.dogsService.findOne(id);
    return { data };
  }

  @Patch(':id')
  @UseGuards(DogOwnerGuard)
  @ApiOperation({ summary: 'Update dog' })
  async update(@Param('id') id: string, @Body() dto: UpdateDogDto): Promise<{ data: unknown }> {
    const data = await this.dogsService.update(id, dto);
    return { data };
  }

  @Delete(':id')
  @UseGuards(DogOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete dog' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.dogsService.remove(id);
  }

  @Post(':id/photo/upload-url')
  @UseGuards(DogOwnerGuard)
  @ApiOperation({ summary: 'Get presigned URL for dog photo' })
  async photoUploadUrl(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: { fileName: string; contentType: string },
  ): Promise<{ data: { uploadUrl: string; key: string } }> {
    const data = await this.dogsService.getPhotoUploadUrl(
      user.id,
      id,
      body.fileName,
      body.contentType,
    );
    return { data };
  }

  @Post(':id/photo/confirm')
  @UseGuards(DogOwnerGuard)
  @ApiOperation({ summary: 'Confirm dog photo upload' })
  async confirmPhoto(
    @Param('id') id: string,
    @Body() body: { key: string },
  ): Promise<{ data: unknown }> {
    const data = await this.dogsService.confirmPhoto(id, body.key);
    return { data };
  }
}
