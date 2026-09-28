import { MenuSection } from '../../domain/entities/menu-section.entity';
import { MenuType } from '../../domain/enums/menu-type.enum';

export class MenuSectionAdminResponseDto {
  readonly id: string;
  readonly menuType: MenuType;
  readonly title: string;
  readonly order: number;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(section: MenuSection) {
    this.id = section.id;
    this.menuType = section.menuType;
    this.title = section.title;
    this.order = section.order;
    this.active = section.active;
    this.createdAt = section.createdAt.toISOString();
    this.updatedAt = section.updatedAt.toISOString();
  }
}
