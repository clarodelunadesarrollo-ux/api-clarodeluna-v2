import { Module } from '@nestjs/common';

import { RolesGuard } from '../../common/auth/roles.guard';
import { BackupService } from './application/backup.service';
import { BackupAdminController } from './presentation/controllers/backup-admin.controller';

@Module({
  controllers: [BackupAdminController],
  providers: [RolesGuard, BackupService],
})
export class BackupModule {}
