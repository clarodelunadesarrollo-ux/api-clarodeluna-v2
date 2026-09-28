import { MenuDish } from '../../../domain/entities/menu-dish.entity';
import { MenuSection } from '../../../domain/entities/menu-section.entity';
import { MenuType } from '../../../domain/enums/menu-type.enum';
import {
    CreateMenuDishData,
    MenuDishRepositoryPort,
    UpdateMenuDishData,
} from '../../ports/out/menu-dish-repository.port';
import {
    MenuMediaStoragePort,
    UploadedMenuMedia,
    UploadMenuMediaInput,
} from '../../ports/out/menu-media-storage.port';
import {
    CreateMenuSectionData,
    MenuSectionRepositoryPort,
    UpdateMenuSectionData,
} from '../../ports/out/menu-section-repository.port';
import { ReservationContextPort } from '../../ports/out/reservation-context.port';

export function buildMenuDish(
  overrides: Partial<{
    id: string;
    sectionId: string;
    name: string;
    description: string;
    imageUrl: string;
    priceCents: number | null;
    tags: string[];
    order: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
): MenuDish {
  return MenuDish.rehydrate({
    id: overrides.id ?? '22222222-2222-2222-2222-222222222222',
    sectionId: overrides.sectionId ?? '11111111-1111-1111-1111-111111111111',
    name: overrides.name ?? 'Provoleta a la parrilla',
    description:
      overrides.description ?? 'Queso provolone grillado con orégano y aceite de oliva.',
    imageUrl:
      overrides.imageUrl ??
      'https://res.cloudinary.com/yjz6pfeh/image/upload/v1790466563/cld-sample-4.jpg',
    priceCents: overrides.priceCents !== undefined ? overrides.priceCents : 650000,
    tags: overrides.tags ?? ['Vegetariano'],
    order: overrides.order ?? 1,
    active: overrides.active ?? true,
    createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2024-01-01T00:00:00.000Z'),
  });
}

export function buildMenuSection(
  overrides: Partial<{
    id: string;
    menuType: MenuType;
    title: string;
    order: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    dishes: MenuDish[];
  }> = {},
): MenuSection {
  return MenuSection.rehydrate({
    id: overrides.id ?? '11111111-1111-1111-1111-111111111111',
    menuType: overrides.menuType ?? MenuType.RESTAURANT,
    title: overrides.title ?? 'Entradas',
    order: overrides.order ?? 1,
    active: overrides.active ?? true,
    createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2024-01-01T00:00:00.000Z'),
    dishes: overrides.dishes ?? [],
  });
}

export interface FakeMenuSectionRepository extends MenuSectionRepositoryPort {
  findActiveByMenuTypeWithDishes: jest.Mock<Promise<MenuSection[]>, [MenuType]>;
  findAllWithDishes: jest.Mock<Promise<MenuSection[]>, []>;
  findById: jest.Mock<Promise<MenuSection | null>, [string]>;
  create: jest.Mock<Promise<MenuSection>, [CreateMenuSectionData]>;
  update: jest.Mock<Promise<MenuSection>, [string, UpdateMenuSectionData]>;
  delete: jest.Mock<Promise<void>, [string]>;
}

export function createFakeMenuSectionRepository(): FakeMenuSectionRepository {
  return {
    findActiveByMenuTypeWithDishes: jest.fn(),
    findAllWithDishes: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

export interface FakeMenuDishRepository extends MenuDishRepositoryPort {
  findById: jest.Mock<Promise<MenuDish | null>, [string]>;
  create: jest.Mock<Promise<MenuDish>, [CreateMenuDishData]>;
  update: jest.Mock<Promise<MenuDish>, [string, UpdateMenuDishData]>;
  delete: jest.Mock<Promise<void>, [string]>;
}

export function createFakeMenuDishRepository(): FakeMenuDishRepository {
  return {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

export interface FakeMenuMediaStorage extends MenuMediaStoragePort {
  upload: jest.Mock<Promise<UploadedMenuMedia>, [UploadMenuMediaInput]>;
  delete: jest.Mock<Promise<void>, [string]>;
}

export function createFakeMenuMediaStorage(): FakeMenuMediaStorage {
  return {
    upload: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  };
}

export interface FakeReservationContext extends ReservationContextPort {
  resolveActiveMenuType: jest.Mock<Promise<MenuType | null>, [string]>;
}

export function createFakeReservationContext(): FakeReservationContext {
  return {
    resolveActiveMenuType: jest.fn(),
  };
}
