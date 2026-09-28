import { Injectable } from '@nestjs/common';
import { OtpStatus as PrismaOtpStatus } from '@prisma/client';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    CreateOtpCodeInput,
    OtpCodeRepositoryPort,
} from '../../../application/ports/out/otp-code-repository.port';
import { OtpCode } from '../../../domain/entities/otp-code.entity';
import { OtpCodeMapper } from '../mappers/otp-code.mapper';

@Injectable()
export class OtpCodePrismaRepository implements OtpCodeRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateOtpCodeInput): Promise<OtpCode> {
    const row = await this.prisma.otpCode.create({
      data: {
        userId: input.userId,
        code: input.hashedCode,
        expiresAt: input.expiresAt,
        createdAt: input.createdAt,
        status: PrismaOtpStatus.ACTIVE,
      },
    });
    return OtpCodeMapper.toDomain(row);
  }

  async findLatestByUserId(userId: string): Promise<OtpCode | null> {
    const row = await this.prisma.otpCode.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return row ? OtpCodeMapper.toDomain(row) : null;
  }

  async findLatestActiveByUserId(userId: string): Promise<OtpCode | null> {
    const row = await this.prisma.otpCode.findFirst({
      where: { userId, status: PrismaOtpStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
    return row ? OtpCodeMapper.toDomain(row) : null;
  }

  async invalidateActiveByUserId(userId: string): Promise<void> {
    await this.prisma.otpCode.updateMany({
      where: { userId, status: PrismaOtpStatus.ACTIVE },
      data: { status: PrismaOtpStatus.INVALIDATED },
    });
  }

  async save(otpCode: OtpCode): Promise<void> {
    const patch = OtpCodeMapper.toPersistence(otpCode);
    await this.prisma.otpCode.update({
      where: { id: otpCode.id },
      data: {
        attempts: patch.attempts,
        status: patch.status,
        consumedAt: patch.consumedAt,
      },
    });
  }
}
