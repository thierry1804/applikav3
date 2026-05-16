import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class AppHealthController {
  @Get()
  getHealth(): { data: { status: string } } {
    return { data: { status: 'ok' } };
  }
}
