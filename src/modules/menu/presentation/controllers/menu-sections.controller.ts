import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { RolesGuard } from '../../../../common/auth/roles.guard';
import { UserRole } from '../../../../common/auth/user-role.enum';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
    CREATE_MENU_SECTION_USE_CASE,
    CreateMenuSectionUseCasePort,
} from '../../application/ports/in/create-menu-section.port';
import {
    DELETE_MENU_SECTION_USE_CASE,
    DeleteMenuSectionUseCasePort,
} from '../../application/ports/in/delete-menu-section.port';
import {
    LIST_ALL_MENU_SECTIONS_USE_CASE,
    ListAllMenuSectionsUseCasePort,
} from '../../application/ports/in/list-all-menu-sections.port';
import {
    UPDATE_MENU_SECTION_USE_CASE,
    UpdateMenuSectionUseCasePort,
} from '../../application/ports/in/update-menu-section.port';
import { CreateMenuSectionDto } from '../dtos/create-menu-section.dto';
import { MenuSectionAdminResponseDto } from '../dtos/menu-section-admin-response.dto';
import { MenuSectionWithDishesAdminResponseDto } from '../dtos/menu-section-with-dishes-admin-response.dto';
import { UpdateMenuSectionDto } from '../dtos/update-menu-section.dto';

// Admin surface for menu sections. Protected by the global JwtAuthGuard AND
// role-restricted to ADMIN via RolesGuard + @Roles.
@Controller('menu/sections')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class MenuSectionsController {
  constructor(
    @Inject(LIST_ALL_MENU_SECTIONS_USE_CASE)
    private readonly listAllSections: ListAllMenuSectionsUseCasePort,
    @Inject(CREATE_MENU_SECTION_USE_CASE)
    private readonly createSection: CreateMenuSectionUseCasePort,
    @Inject(UPDATE_MENU_SECTION_USE_CASE)
    private readonly updateSection: UpdateMenuSectionUseCasePort,
    @Inject(DELETE_MENU_SECTION_USE_CASE)
    private readonly deleteSection: DeleteMenuSectionUseCasePort,
  ) {}

  @Get()
  async list(): Promise<MenuSectionWithDishesAdminResponseDto[]> {
    const sections = await this.listAllSections.execute();
    return sections.map(
      (section) => new MenuSectionWithDishesAdminResponseDto(section),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateMenuSectionDto,
  ): Promise<MenuSectionAdminResponseDto> {
    const section = await this.createSection.execute(dto);
    return new MenuSectionAdminResponseDto(section);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMenuSectionDto,
  ): Promise<MenuSectionAdminResponseDto> {
    const section = await this.updateSection.execute(id, dto);
    return new MenuSectionAdminResponseDto(section);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteSection.execute(id);
  }
}
