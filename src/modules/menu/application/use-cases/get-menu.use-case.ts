import { NoActiveMenuContextException } from '../../domain/exceptions/no-active-menu-context.exception';
import { GetMenuUseCasePort, MenuView } from '../ports/in/get-menu.port';
import { MenuSectionRepositoryPort } from '../ports/out/menu-section-repository.port';
import { ReservationContextPort } from '../ports/out/reservation-context.port';

export class GetMenuUseCase implements GetMenuUseCasePort {
  constructor(
    private readonly context: ReservationContextPort,
    private readonly sections: MenuSectionRepositoryPort,
  ) {}

  async execute(userId: string): Promise<MenuView> {
    const menuType = await this.context.resolveActiveMenuType(userId);
    if (menuType === null) {
      throw new NoActiveMenuContextException();
    }
    const sections = await this.sections.findActiveByMenuTypeWithDishes(menuType);
    return { menuType, sections };
  }
}
