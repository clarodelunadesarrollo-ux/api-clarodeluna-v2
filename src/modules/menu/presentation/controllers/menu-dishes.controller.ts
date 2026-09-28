import {
    Body,
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { RolesGuard } from '../../../../common/auth/roles.guard';
import { UserRole } from '../../../../common/auth/user-role.enum';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
    CREATE_MENU_DISH_USE_CASE,
    CreateMenuDishUseCasePort,
} from '../../application/ports/in/create-menu-dish.port';
import {
    DELETE_MENU_DISH_USE_CASE,
    DeleteMenuDishUseCasePort,
} from '../../application/ports/in/delete-menu-dish.port';
import {
    UPDATE_MENU_DISH_USE_CASE,
    UpdateMenuDishUseCasePort,
} from '../../application/ports/in/update-menu-dish.port';
import {
    UPLOAD_MENU_MEDIA_USE_CASE,
    UploadMenuMediaUseCasePort,
} from '../../application/ports/in/upload-menu-media.port';
import { InvalidMenuMediaException } from '../../domain/exceptions/invalid-menu-media.exception';
import { CreateMenuDishDto } from '../dtos/create-menu-dish.dto';
import { MenuDishAdminResponseDto } from '../dtos/menu-dish-admin-response.dto';
import { UpdateMenuDishDto } from '../dtos/update-menu-dish.dto';
import { UploadMenuMediaResponseDto } from '../dtos/upload-menu-media-response.dto';

// Admin surface for menu dishes. Protected by the global JwtAuthGuard AND
// role-restricted to ADMIN via RolesGuard + @Roles.
@Controller('menu/dishes')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class MenuDishesController {
  constructor(
    @Inject(CREATE_MENU_DISH_USE_CASE)
    private readonly createDish: CreateMenuDishUseCasePort,
    @Inject(UPDATE_MENU_DISH_USE_CASE)
    private readonly updateDish: UpdateMenuDishUseCasePort,
    @Inject(DELETE_MENU_DISH_USE_CASE)
    private readonly deleteDish: DeleteMenuDishUseCasePort,
    @Inject(UPLOAD_MENU_MEDIA_USE_CASE)
    private readonly uploadMedia: UploadMenuMediaUseCasePort,
  ) {}

  @Post('media')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('media'))
  async uploadMediaFile(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UploadMenuMediaResponseDto> {
    if (!file) {
      throw new InvalidMenuMediaException(
        'media file is required',
        'Adjuntá una imagen.',
      );
    }
    const result = await this.uploadMedia.execute({
      buffer: file.buffer,
      mimeType: file.mimetype,
    });
    return new UploadMenuMediaResponseDto(result.imageUrl);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMenuDishDto): Promise<MenuDishAdminResponseDto> {
    const dish = await this.createDish.execute(dto);
    return new MenuDishAdminResponseDto(dish);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMenuDishDto,
  ): Promise<MenuDishAdminResponseDto> {
    const dish = await this.updateDish.execute(id, dto);
    return new MenuDishAdminResponseDto(dish);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteDish.execute(id);
  }
}
