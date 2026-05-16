import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '@dogapp/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('account')
@Controller('account')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: AuthUser): Promise<{ data: AuthUser }> {
    const data = await this.usersService.getMe(user.id);
    return { data };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateUserDto,
  ): Promise<{ data: AuthUser }> {
    const data = await this.usersService.updateMe(user.id, dto);
    return { data };
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete account (soft delete)' })
  async deleteAccount(@CurrentUser() user: AuthUser): Promise<void> {
    await this.usersService.deleteAccount(user.id);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export account data' })
  async exportAccount(@CurrentUser() user: AuthUser): Promise<{ data: unknown }> {
    return this.usersService.exportAccount(user.id);
  }

  @Post('avatar/upload-url')
  @ApiOperation({ summary: 'Get presigned URL for avatar upload' })
  async avatarUploadUrl(
    @CurrentUser() user: AuthUser,
    @Body() body: { fileName: string; contentType: string },
  ): Promise<{ data: { uploadUrl: string; key: string } }> {
    const data = await this.usersService.getAvatarUploadUrl(
      user.id,
      body.fileName,
      body.contentType,
    );
    return { data };
  }

  @Post('avatar/confirm')
  @ApiOperation({ summary: 'Confirm avatar upload' })
  async confirmAvatar(
    @CurrentUser() user: AuthUser,
    @Body() body: { key: string },
  ): Promise<{ data: AuthUser }> {
    const data = await this.usersService.confirmAvatar(user.id, body.key);
    return { data };
  }
}
