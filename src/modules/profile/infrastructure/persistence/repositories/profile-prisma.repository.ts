import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    ProfileRepositoryPort,
    ProfileView,
} from '../../../application/ports/out/profile-repository.port';

@Injectable()
export class ProfilePrismaRepository implements ProfileRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<ProfileView | null> {
    const row = await this.prisma.user.findUnique({ where: { id: userId } });
    return row ? { userId: row.id, name: row.name, email: row.email } : null;
  }

  async updateName(userId: string, name: string | null): Promise<ProfileView> {
    const row = await this.prisma.user.update({
      where: { id: userId },
      data: { name },
    });
    return { userId: row.id, name: row.name, email: row.email };
  }
}
