import { TourStop } from '../../../domain/entities/tour-stop.entity';
import {
    CreateTourStopData,
    TourStopRepositoryPort,
    UpdateTourStopData,
} from '../../ports/out/tour-stop-repository.port';

export function buildTourStop(overrides: Partial<{
  id: string;
  order: number;
  title: string;
  description: string;
  positionX: number;
  positionY: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}> = {}): TourStop {
  return TourStop.rehydrate({
    id: overrides.id ?? '11111111-1111-1111-1111-111111111111',
    order: overrides.order ?? 1,
    title: overrides.title ?? 'Llegada y recepción',
    description: overrides.description ?? 'Te recibimos en la entrada principal.',
    positionX: overrides.positionX ?? 0.42,
    positionY: overrides.positionY ?? 0.68,
    active: overrides.active ?? true,
    createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2024-01-01T00:00:00.000Z'),
  });
}

export interface FakeTourStopRepository extends TourStopRepositoryPort {
  findAllActiveOrdered: jest.Mock<Promise<TourStop[]>, []>;
  findById: jest.Mock<Promise<TourStop | null>, [string]>;
  create: jest.Mock<Promise<TourStop>, [CreateTourStopData]>;
  update: jest.Mock<Promise<TourStop>, [string, UpdateTourStopData]>;
  delete: jest.Mock<Promise<void>, [string]>;
}

export function createFakeTourStopRepository(): FakeTourStopRepository {
  return {
    findAllActiveOrdered: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}
