import { User as PrismaUser } from '@prisma/client';

import { User } from '../../../domain/entities/user.entity';

export class UserMapper {
  static toDomain(row: PrismaUser): User {
    return User.rehydrate({
      id: row.id,
      email: row.email,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
