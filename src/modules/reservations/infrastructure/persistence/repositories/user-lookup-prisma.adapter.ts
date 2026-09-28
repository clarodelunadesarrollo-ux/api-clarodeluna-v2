import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    UserLookupPort,
    UserProfile,
} from '../../../application/ports/out/user-lookup.port';

@Injectable()
export class UserLookupPrismaAdapter implements UserLookupPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string): Promise<UserProfile | null> {
    const row = await this.prisma.user.findUnique({ where: { id: userId } });
    return row ? { id: row.id, name: row.name, email: row.email } : null;
  }
}
