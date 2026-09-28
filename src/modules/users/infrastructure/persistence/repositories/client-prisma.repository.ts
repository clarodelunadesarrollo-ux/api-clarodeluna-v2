import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    ClientRepositoryPort,
    ClientView,
} from '../../../application/ports/out/client-repository.port';

/**
 * Prisma adapter for admin client management. Every operation is scoped to the
 * CLIENT role so admins are never listed or removed. Deletes cascade to the
 * user's reservations, conversation, messages and OTP codes via the schema's
 * `onDelete: Cascade` relations.
 */
@Injectable()
export class ClientPrismaRepository implements ClientRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAllClients(): Promise<ClientView[]> {
    const rows = await this.prisma.user.findMany({
      where: { role: UserRole.CLIENT },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      createdAt: row.createdAt,
    }));
  }

  async deleteClient(id: string): Promise<void> {
    const result = await this.prisma.user.deleteMany({
      where: { id, role: UserRole.CLIENT },
    });
    if (result.count === 0) {
      throw new NotFoundException('El cliente solicitado no existe.');
    }
  }

  async deleteAllClients(): Promise<number> {
    const result = await this.prisma.user.deleteMany({
      where: { role: UserRole.CLIENT },
    });
    return result.count;
  }
}
