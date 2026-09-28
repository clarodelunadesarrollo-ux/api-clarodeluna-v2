import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../prisma/prisma.service';
import { UserRepositoryPort } from '../../../application/ports/out/user-repository.port';
import { User } from '../../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserPrismaRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findOrCreateByEmail(email: string): Promise<User> {
    const row = await this.prisma.user.upsert({
      where: { email },
      create: { email },
      update: {},
    });
    return UserMapper.toDomain(row);
  }
}
