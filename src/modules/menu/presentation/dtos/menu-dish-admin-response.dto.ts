import { MenuDish } from '../../domain/entities/menu-dish.entity';

export class MenuDishAdminResponseDto {
  readonly id: string;
  readonly sectionId: string;
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly priceCents: number | null;
  readonly tags: string[];
  readonly order: number;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(dish: MenuDish) {
    this.id = dish.id;
    this.sectionId = dish.sectionId;
    this.name = dish.name;
    this.description = dish.description;
    this.imageUrl = dish.imageUrl;
    this.priceCents = dish.priceCents;
    this.tags = dish.tags;
    this.order = dish.order;
    this.active = dish.active;
    this.createdAt = dish.createdAt.toISOString();
    this.updatedAt = dish.updatedAt.toISOString();
  }
}
