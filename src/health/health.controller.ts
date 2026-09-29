import { Controller, Get } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';

// Lightweight liveness probe. Public so uptime monitors and clients can check
// availability without a token. Does not touch the database on purpose: it only
// reports that the HTTP layer is up.
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check(): { status: 'ok'; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
