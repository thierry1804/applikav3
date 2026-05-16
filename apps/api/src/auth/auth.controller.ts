import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '@dogapp/types';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto): Promise<{ data: unknown }> {
    const result = await this.authService.register(dto);
    return {
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  async login(@Body() dto: LoginDto): Promise<{ data: unknown }> {
    const result = await this.authService.login(dto);
    return {
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshDto): Promise<{ data: unknown }> {
    const parts = dto.refresh_token.split('.');
    if (parts.length < 2) {
      const tokens = await this.authService.refreshFromOpaque(dto.refresh_token);
      return { data: tokens };
    }
    const tokenId = parts[0];
    const raw = parts.slice(1).join('.');
    if (!tokenId || !raw) {
      const tokens = await this.authService.refreshFromOpaque(dto.refresh_token);
      return { data: tokens };
    }
    const tokens = await this.authService.refresh(tokenId, raw);
    return { data: tokens };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout current session' })
  async logout(@Body() dto: RefreshDto): Promise<void> {
    const tokenId = dto.refresh_token.split('.')[0];
    if (tokenId) {
      await this.authService.logout(tokenId);
    }
  }

  @Post('revoke-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Revoke all sessions' })
  async revokeAll(@CurrentUser() user: AuthUser): Promise<void> {
    await this.authService.revokeAll(user.id);
  }
}
