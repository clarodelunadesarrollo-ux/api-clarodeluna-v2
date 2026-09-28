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
    CREATE_PROMO_USE_CASE,
    CreatePromoUseCasePort,
} from '../../application/ports/in/create-promo.port';
import {
    DELETE_PROMO_USE_CASE,
    DeletePromoUseCasePort,
} from '../../application/ports/in/delete-promo.port';
import {
    LIST_ALL_PROMOS_USE_CASE,
    ListAllPromosUseCasePort,
} from '../../application/ports/in/list-all-promos.port';
import {
    UPDATE_PROMO_USE_CASE,
    UpdatePromoUseCasePort,
} from '../../application/ports/in/update-promo.port';
import {
    UPLOAD_PROMO_IMAGE_USE_CASE,
    UploadPromoImageUseCasePort,
} from '../../application/ports/in/upload-promo-image.port';
import { InvalidPromoImageException } from '../../domain/exceptions/invalid-promo-image.exception';
import { CreatePromoDto } from '../dtos/create-promo.dto';
import { PromoAdminResponseDto } from '../dtos/promo-admin-response.dto';
import { UpdatePromoDto } from '../dtos/update-promo.dto';
import { UploadPromoImageResponseDto } from '../dtos/upload-promo-image-response.dto';

// Admin surface for promo cards. Protected by the global JwtAuthGuard AND
// role-restricted to ADMIN via RolesGuard + @Roles.
@Controller('promos/admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class PromosAdminController {
  constructor(
    @Inject(LIST_ALL_PROMOS_USE_CASE)
    private readonly listAllPromos: ListAllPromosUseCasePort,
    @Inject(CREATE_PROMO_USE_CASE)
    private readonly createPromo: CreatePromoUseCasePort,
    @Inject(UPDATE_PROMO_USE_CASE)
    private readonly updatePromo: UpdatePromoUseCasePort,
    @Inject(DELETE_PROMO_USE_CASE)
    private readonly deletePromo: DeletePromoUseCasePort,
    @Inject(UPLOAD_PROMO_IMAGE_USE_CASE)
    private readonly uploadPromoImage: UploadPromoImageUseCasePort,
  ) {}

  @Get()
  async list(): Promise<PromoAdminResponseDto[]> {
    const promos = await this.listAllPromos.execute();
    return promos.map((promo) => new PromoAdminResponseDto(promo));
  }

  @Post('image')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<UploadPromoImageResponseDto> {
    if (!file) {
      throw new InvalidPromoImageException(
        'image file is required',
        'Adjuntá una imagen.',
      );
    }
    const result = await this.uploadPromoImage.execute({
      buffer: file.buffer,
      mimeType: file.mimetype,
    });
    return new UploadPromoImageResponseDto(result.imageUrl);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePromoDto): Promise<PromoAdminResponseDto> {
    const promo = await this.createPromo.execute(dto);
    return new PromoAdminResponseDto(promo);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePromoDto,
  ): Promise<PromoAdminResponseDto> {
    const promo = await this.updatePromo.execute(id, dto);
    return new PromoAdminResponseDto(promo);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deletePromo.execute(id);
  }
}
