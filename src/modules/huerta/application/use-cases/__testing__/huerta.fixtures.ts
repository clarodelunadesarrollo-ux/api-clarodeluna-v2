import { HuertaItem } from '../../../domain/entities/huerta-item.entity';
import { HuertaItemType } from '../../../domain/enums/huerta-item-type.enum';
import { HuertaAccessPort } from '../../ports/out/huerta-access.port';
import {
    CreateHuertaItemData,
    HuertaItemRepositoryPort,
    UpdateHuertaItemData,
} from '../../ports/out/huerta-item-repository.port';
import {
    HuertaMediaStoragePort,
    UploadedHuertaMedia,
    UploadHuertaMediaInput,
} from '../../ports/out/huerta-media-storage.port';

const SAMPLE_IMAGE_URL =
  'https://res.cloudinary.com/yjz6pfeh/image/upload/v1790466563/cld-sample-4.jpg';

export function buildHuertaItem(
  overrides: Partial<{
    id: string;
    type: HuertaItemType;
    title: string;
    description: string | null;
    mediaUrl: string;
    posterUrl: string | null;
    order: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
): HuertaItem {
  const type = overrides.type ?? HuertaItemType.IMAGE;
  return HuertaItem.rehydrate({
    id: overrides.id ?? '22222222-2222-2222-2222-222222222222',
    type,
    title: overrides.title ?? 'Compostaje',
    description:
      overrides.description !== undefined
        ? overrides.description
        : 'Cómo transformamos los restos en abono.',
    mediaUrl: overrides.mediaUrl ?? SAMPLE_IMAGE_URL,
    posterUrl:
      overrides.posterUrl !== undefined
        ? overrides.posterUrl
        : type === HuertaItemType.VIDEO
          ? SAMPLE_IMAGE_URL
          : null,
    order: overrides.order ?? 1,
    active: overrides.active ?? true,
    createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2024-01-01T00:00:00.000Z'),
  });
}

export interface FakeHuertaItemRepository extends HuertaItemRepositoryPort {
  findActiveOrdered: jest.Mock<Promise<HuertaItem[]>, []>;
  findAllOrdered: jest.Mock<Promise<HuertaItem[]>, []>;
  findById: jest.Mock<Promise<HuertaItem | null>, [string]>;
  create: jest.Mock<Promise<HuertaItem>, [CreateHuertaItemData]>;
  update: jest.Mock<Promise<HuertaItem>, [string, UpdateHuertaItemData]>;
  delete: jest.Mock<Promise<void>, [string]>;
}

export function createFakeHuertaItemRepository(): FakeHuertaItemRepository {
  return {
    findActiveOrdered: jest.fn(),
    findAllOrdered: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

export interface FakeHuertaAccess extends HuertaAccessPort {
  hasCheckedInToday: jest.Mock<Promise<boolean>, [string]>;
}

export function createFakeHuertaAccess(): FakeHuertaAccess {
  return {
    hasCheckedInToday: jest.fn(),
  };
}

export interface FakeHuertaMediaStorage extends HuertaMediaStoragePort {
  upload: jest.Mock<Promise<UploadedHuertaMedia>, [UploadHuertaMediaInput]>;
  delete: jest.Mock<Promise<void>, [string]>;
}

export function createFakeHuertaMediaStorage(): FakeHuertaMediaStorage {
  return {
    upload: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  };
}
