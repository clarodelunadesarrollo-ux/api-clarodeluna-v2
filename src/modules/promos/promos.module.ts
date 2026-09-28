import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RolesGuard } from '../../common/auth/roles.guard';
import { CREATE_PROMO_USE_CASE } from './application/ports/in/create-promo.port';
import { DELETE_PROMO_USE_CASE } from './application/ports/in/delete-promo.port';
import { LIST_ACTIVE_PROMOS_USE_CASE } from './application/ports/in/list-active-promos.port';
import { LIST_ALL_PROMOS_USE_CASE } from './application/ports/in/list-all-promos.port';
import { UPDATE_PROMO_USE_CASE } from './application/ports/in/update-promo.port';
import { UPLOAD_PROMO_IMAGE_USE_CASE } from './application/ports/in/upload-promo-image.port';
import {
    PROMO_CARD_REPOSITORY,
    PromoCardRepositoryPort,
} from './application/ports/out/promo-card-repository.port';
import {
    PROMO_IMAGE_STORAGE,
    PromoImageStoragePort,
} from './application/ports/out/promo-image-storage.port';
import { CreatePromoUseCase } from './application/use-cases/create-promo.use-case';
import { DeletePromoUseCase } from './application/use-cases/delete-promo.use-case';
import { ListActivePromosUseCase } from './application/use-cases/list-active-promos.use-case';
import { ListAllPromosUseCase } from './application/use-cases/list-all-promos.use-case';
import { UpdatePromoUseCase } from './application/use-cases/update-promo.use-case';
import { UploadPromoImageUseCase } from './application/use-cases/upload-promo-image.use-case';
import { PromoCardPrismaRepository } from './infrastructure/persistence/repositories/promo-card-prisma.repository';
import { CloudinaryPromoImageStorageAdapter } from './infrastructure/storage/cloudinary-promo-image-storage.adapter';
import { PromosAdminController } from './presentation/controllers/promos-admin.controller';
import { PromosController } from './presentation/controllers/promos.controller';

@Module({
  controllers: [PromosController, PromosAdminController],
  providers: [
    RolesGuard,
    { provide: PROMO_CARD_REPOSITORY, useClass: PromoCardPrismaRepository },
    {
      provide: PROMO_IMAGE_STORAGE,
      useFactory: (config: ConfigService): CloudinaryPromoImageStorageAdapter =>
        new CloudinaryPromoImageStorageAdapter({
          cloudName: config.get<string>('CLOUDINARY_CLOUD_NAME'),
          apiKey: config.get<string>('CLOUDINARY_API_KEY'),
          apiSecret: config.get<string>('CLOUDINARY_API_SECRET'),
          folder: config.get<string>('CLOUDINARY_PROMOS_FOLDER') ?? 'promos',
        }),
      inject: [ConfigService],
    },
    {
      provide: LIST_ACTIVE_PROMOS_USE_CASE,
      useFactory: (promos: PromoCardRepositoryPort): ListActivePromosUseCase =>
        new ListActivePromosUseCase(promos),
      inject: [PROMO_CARD_REPOSITORY],
    },
    {
      provide: LIST_ALL_PROMOS_USE_CASE,
      useFactory: (promos: PromoCardRepositoryPort): ListAllPromosUseCase =>
        new ListAllPromosUseCase(promos),
      inject: [PROMO_CARD_REPOSITORY],
    },
    {
      provide: CREATE_PROMO_USE_CASE,
      useFactory: (promos: PromoCardRepositoryPort): CreatePromoUseCase =>
        new CreatePromoUseCase(promos),
      inject: [PROMO_CARD_REPOSITORY],
    },
    {
      provide: UPDATE_PROMO_USE_CASE,
      useFactory: (promos: PromoCardRepositoryPort): UpdatePromoUseCase =>
        new UpdatePromoUseCase(promos),
      inject: [PROMO_CARD_REPOSITORY],
    },
    {
      provide: DELETE_PROMO_USE_CASE,
      useFactory: (
        promos: PromoCardRepositoryPort,
        images: PromoImageStoragePort,
      ): DeletePromoUseCase => new DeletePromoUseCase(promos, images),
      inject: [PROMO_CARD_REPOSITORY, PROMO_IMAGE_STORAGE],
    },
    {
      provide: UPLOAD_PROMO_IMAGE_USE_CASE,
      useFactory: (
        storage: PromoImageStoragePort,
      ): UploadPromoImageUseCase => new UploadPromoImageUseCase(storage),
      inject: [PROMO_IMAGE_STORAGE],
    },
  ],
})
export class PromosModule {}
