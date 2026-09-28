import { Controller, Get, Inject } from '@nestjs/common';

import {
    AuthenticatedUser,
    CurrentUser,
} from '../../../../common/auth/current-user.decorator';
import {
    GET_MENU_USE_CASE,
    GetMenuUseCasePort,
} from '../../application/ports/in/get-menu.port';
import { MenuResponseDto } from '../dtos/menu-response.dto';

// Protected by the global JwtAuthGuard. The guest app consumes this after
// check-in; the menu context (TOUR vs RESTAURANT) is resolved server-side from
// the user's active reservation (AD-1).
@Controller('menu')
export class MenuController {
  constructor(
    @Inject(GET_MENU_USE_CASE)
    private readonly getMenu: GetMenuUseCasePort,
  ) {}

  @Get()
  async get(@CurrentUser() user: AuthenticatedUser): Promise<MenuResponseDto> {
    const view = await this.getMenu.execute(user.userId);
    return new MenuResponseDto(view);
  }
}
