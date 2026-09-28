import {
    OtpCode as PrismaOtpCode,
    OtpStatus as PrismaOtpStatus,
} from '@prisma/client';

import { OtpCode } from '../../../domain/entities/otp-code.entity';
import { OtpStatus } from '../../../domain/enums/otp-status.enum';

const TO_DOMAIN_STATUS: Record<PrismaOtpStatus, OtpStatus> = {
  ACTIVE: OtpStatus.ACTIVE,
  CONSUMED: OtpStatus.CONSUMED,
  EXPIRED: OtpStatus.EXPIRED,
  INVALIDATED: OtpStatus.INVALIDATED,
};

const TO_PERSISTENCE_STATUS: Record<OtpStatus, PrismaOtpStatus> = {
  [OtpStatus.ACTIVE]: PrismaOtpStatus.ACTIVE,
  [OtpStatus.CONSUMED]: PrismaOtpStatus.CONSUMED,
  [OtpStatus.EXPIRED]: PrismaOtpStatus.EXPIRED,
  [OtpStatus.INVALIDATED]: PrismaOtpStatus.INVALIDATED,
};

export interface OtpCodePersistencePatch {
  attempts: number;
  status: PrismaOtpStatus;
  consumedAt: Date | null;
}

export class OtpCodeMapper {
  static toDomain(row: PrismaOtpCode): OtpCode {
    return OtpCode.rehydrate({
      id: row.id,
      userId: row.userId,
      hashedCode: row.code,
      attempts: row.attempts,
      status: TO_DOMAIN_STATUS[row.status],
      expiresAt: row.expiresAt,
      consumedAt: row.consumedAt,
      createdAt: row.createdAt,
    });
  }

  /** Mutable fields updated by the validation flow. */
  static toPersistence(entity: OtpCode): OtpCodePersistencePatch {
    return {
      attempts: entity.attempts,
      status: TO_PERSISTENCE_STATUS[entity.status],
      consumedAt: entity.consumedAt,
    };
  }
}
