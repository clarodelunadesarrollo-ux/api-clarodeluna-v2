import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';

import { RolesGuard } from '../../../../common/auth/roles.guard';
import { UserRole } from '../../../../common/auth/user-role.enum';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
    BackupBundle,
    BackupService,
    ImportSummary,
} from '../../application/backup.service';

// Admin surface for full-content backup. Protected by the global JwtAuthGuard
// AND role-restricted to ADMIN via RolesGuard + @Roles. Exports/imports every
// admin-authored collection plus reservation configuration; users, chat and
// client reservations are never included.
@Controller('backup/admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class BackupAdminController {
  constructor(private readonly backup: BackupService) {}

  @Get('export')
  async export(): Promise<BackupBundle> {
    return this.backup.export();
  }

  // The bundle is validated inside the service; the global strict ValidationPipe
  // is bypassed by accepting the raw body (unknown), since its shape is dynamic.
  @Post('import')
  @HttpCode(HttpStatus.OK)
  async import(@Body() body: unknown): Promise<ImportSummary> {
    return this.backup.import(body);
  }
}
