import { PromoCard } from '../../../domain/entities/promo-card.entity';
import {
    CreatePromoCardData,
    PromoCardRepositoryPort,
    UpdatePromoCardData,
} from '../../ports/out/promo-card-repository.port';
import {
    PromoImageStoragePort,
    UploadedPromoImage,
    UploadPromoImageInput,
} from '../../ports/out/promo-image-storage.port';

export function buildPromoCard(
  overrides: Partial<{
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string | null;
    icon: string | null;
    order: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
): PromoCard {
  return PromoCard.rehydrate({
    id: overrides.id ?? '33333333-3333-3333-3333-333333333333',
    title: overrides.title ?? 'Noche de cosecha',
    subtitle:
      overrides.subtitle ?? 'Menú de autor con productos de nuestra huerta.',
    imageUrl: overrides.imageUrl !== undefined ? overrides.imageUrl : null,
    icon: overrides.icon !== undefined ? overrides.icon : 'restaurant',
    order: overrides.order ?? 1,
    active: overrides.active ?? true,
    createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2024-01-01T00:00:00.000Z'),
  });
}

export interface FakePromoCardRepository extends PromoCardRepositoryPort {
  findActiveOrdered: jest.Mock<Promise<PromoCard[]>, []>;
  findAllOrdered: jest.Mock<Promise<PromoCard[]>, []>;
  findById: jest.Mock<Promise<PromoCard | null>, [string]>;
  create: jest.Mock<Promise<PromoCard>, [CreatePromoCardData]>;
  update: jest.Mock<Promise<PromoCard>, [string, UpdatePromoCardData]>;
  delete: jest.Mock<Promise<void>, [string]>;
}

export function createFakePromoCardRepository(): FakePromoCardRepository {
  return {
    findActiveOrdered: jest.fn(),
    findAllOrdered: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

export interface FakePromoImageStorage extends PromoImageStoragePort {
  upload: jest.Mock<Promise<UploadedPromoImage>, [UploadPromoImageInput]>;
  delete: jest.Mock<Promise<void>, [string]>;
}

export function createFakePromoImageStorage(): FakePromoImageStorage {
  return {
    upload: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  };
}
