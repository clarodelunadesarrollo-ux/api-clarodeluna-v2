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
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { RolesGuard } from '../../../../common/auth/roles.guard';
import { UserRole } from '../../../../common/auth/user-role.enum';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
    CREATE_HUERTA_ITEM_USE_CASE,
    CreateHuertaItemUseCasePort,
} from '../../application/ports/in/create-huerta-item.port';
import {
    DELETE_HUERTA_ITEM_USE_CASE,
    DeleteHuertaItemUseCasePort,
} from '../../application/ports/in/delete-huerta-item.port';
import {
    LIST_ALL_HUERTA_ITEMS_USE_CASE,
    ListAllHuertaItemsUseCasePort,
} from '../../application/ports/in/list-all-huerta-items.port';
import {
    UPDATE_HUERTA_ITEM_USE_CASE,
    UpdateHuertaItemUseCasePort,
} from '../../application/ports/in/update-huerta-item.port';
import {
    UPLOAD_HUERTA_MEDIA_USE_CASE,
    UploadHuertaMediaUseCasePort,
} from '../../application/ports/in/upload-huerta-media.port';
import { InvalidHuertaMediaException } from '../../domain/exceptions/invalid-huerta-media.exception';
import { CreateHuertaItemDto } from '../dtos/create-huerta-item.dto';
import { HuertaItemAdminResponseDto } from '../dtos/huerta-item-admin-response.dto';
import { UpdateHuertaItemDto } from '../dtos/update-huerta-item.dto';
import { UploadHuertaMediaResponseDto } from '../dtos/upload-huerta-media-response.dto';

// Admin surface for huerta items. Protected by the global JwtAuthGuard AND
// role-restricted to ADMIN via RolesGuard + @Roles.
@Controller('huerta/items')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class HuertaItemsController {
  constructor(
    @Inject(LIST_ALL_HUERTA_ITEMS_USE_CASE)
    private readonly listAllItems: ListAllHuertaItemsUseCasePort,
    @Inject(CREATE_HUERTA_ITEM_USE_CASE)
    private readonly createItem: CreateHuertaItemUseCasePort,
    @Inject(UPDATE_HUERTA_ITEM_USE_CASE)
    private readonly updateItem: UpdateHuertaItemUseCasePort,
    @Inject(DELETE_HUERTA_ITEM_USE_CASE)
    private readonly deleteItem: DeleteHuertaItemUseCasePort,
    @Inject(UPLOAD_HUERTA_MEDIA_USE_CASE)
    private readonly uploadMedia: UploadHuertaMediaUseCasePort,
  ) {}

  @Get()
  async list(): Promise<HuertaItemAdminResponseDto[]> {
    const items = await this.listAllItems.execute();
    return items.map((item) => new HuertaItemAdminResponseDto(item));
  }

  @Post('media')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('media'))
  async uploadMediaFile(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UploadHuertaMediaResponseDto> {
    if (!file) {
      throw new InvalidHuertaMediaException(
        'media file is required',
        'Adjuntá una imagen o un video.',
      );
    }
    const result = await this.uploadMedia.execute({
      buffer: file.buffer,
      mimeType: file.mimetype,
    });
    return new UploadHuertaMediaResponseDto(result.mediaUrl);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateHuertaItemDto,
  ): Promise<HuertaItemAdminResponseDto> {
    const item = await this.createItem.execute(dto);
    return new HuertaItemAdminResponseDto(item);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHuertaItemDto,
  ): Promise<HuertaItemAdminResponseDto> {
    const item = await this.updateItem.execute(id, dto);
    return new HuertaItemAdminResponseDto(item);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteItem.execute(id);
  }
}
