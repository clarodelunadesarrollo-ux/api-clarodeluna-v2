import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RolesGuard } from '../../common/auth/roles.guard';
import { BOGOTA_CLOCK, BogotaClock } from '../../common/time/bogota-clock';
import { CREATE_HUERTA_ITEM_USE_CASE } from './application/ports/in/create-huerta-item.port';
import { DELETE_HUERTA_ITEM_USE_CASE } from './application/ports/in/delete-huerta-item.port';
import { GET_HUERTA_USE_CASE } from './application/ports/in/get-huerta.port';
import { LIST_ALL_HUERTA_ITEMS_USE_CASE } from './application/ports/in/list-all-huerta-items.port';
import { UPDATE_HUERTA_ITEM_USE_CASE } from './application/ports/in/update-huerta-item.port';
import { UPLOAD_HUERTA_MEDIA_USE_CASE } from './application/ports/in/upload-huerta-media.port';
import {
    HUERTA_ACCESS,
    HuertaAccessPort,
} from './application/ports/out/huerta-access.port';
import {
    HUERTA_ITEM_REPOSITORY,
    HuertaItemRepositoryPort,
} from './application/ports/out/huerta-item-repository.port';
import {
    HUERTA_MEDIA_STORAGE,
    HuertaMediaStoragePort,
} from './application/ports/out/huerta-media-storage.port';
import { CreateHuertaItemUseCase } from './application/use-cases/create-huerta-item.use-case';
import { DeleteHuertaItemUseCase } from './application/use-cases/delete-huerta-item.use-case';
import { GetHuertaUseCase } from './application/use-cases/get-huerta.use-case';
import { ListAllHuertaItemsUseCase } from './application/use-cases/list-all-huerta-items.use-case';
import { UpdateHuertaItemUseCase } from './application/use-cases/update-huerta-item.use-case';
import { UploadHuertaMediaUseCase } from './application/use-cases/upload-huerta-media.use-case';
import { HuertaAccessPrismaAdapter } from './infrastructure/persistence/repositories/huerta-access-prisma.adapter';
import { HuertaItemPrismaRepository } from './infrastructure/persistence/repositories/huerta-item-prisma.repository';
import { CloudinaryHuertaMediaStorageAdapter } from './infrastructure/storage/cloudinary-huerta-media-storage.adapter';
import { HuertaItemsController } from './presentation/controllers/huerta-items.controller';
import { HuertaController } from './presentation/controllers/huerta.controller';

@Module({
  controllers: [HuertaController, HuertaItemsController],
  providers: [
    RolesGuard,
    { provide: BOGOTA_CLOCK, useClass: BogotaClock },
    { provide: HUERTA_ITEM_REPOSITORY, useClass: HuertaItemPrismaRepository },
    { provide: HUERTA_ACCESS, useClass: HuertaAccessPrismaAdapter },
    {
      provide: HUERTA_MEDIA_STORAGE,
      useFactory: (
        config: ConfigService,
      ): CloudinaryHuertaMediaStorageAdapter =>
        new CloudinaryHuertaMediaStorageAdapter({
          cloudName: config.get<string>('CLOUDINARY_CLOUD_NAME'),
          apiKey: config.get<string>('CLOUDINARY_API_KEY'),
          apiSecret: config.get<string>('CLOUDINARY_API_SECRET'),
          folder: config.get<string>('CLOUDINARY_HUERTA_FOLDER') ?? 'huerta',
        }),
      inject: [ConfigService],
    },
    {
      provide: GET_HUERTA_USE_CASE,
      useFactory: (
        access: HuertaAccessPort,
        items: HuertaItemRepositoryPort,
      ): GetHuertaUseCase => new GetHuertaUseCase(access, items),
      inject: [HUERTA_ACCESS, HUERTA_ITEM_REPOSITORY],
    },
    {
      provide: LIST_ALL_HUERTA_ITEMS_USE_CASE,
      useFactory: (
        items: HuertaItemRepositoryPort,
      ): ListAllHuertaItemsUseCase => new ListAllHuertaItemsUseCase(items),
      inject: [HUERTA_ITEM_REPOSITORY],
    },
    {
      provide: CREATE_HUERTA_ITEM_USE_CASE,
      useFactory: (items: HuertaItemRepositoryPort): CreateHuertaItemUseCase =>
        new CreateHuertaItemUseCase(items),
      inject: [HUERTA_ITEM_REPOSITORY],
    },
    {
      provide: UPDATE_HUERTA_ITEM_USE_CASE,
      useFactory: (items: HuertaItemRepositoryPort): UpdateHuertaItemUseCase =>
        new UpdateHuertaItemUseCase(items),
      inject: [HUERTA_ITEM_REPOSITORY],
    },
    {
      provide: DELETE_HUERTA_ITEM_USE_CASE,
      useFactory: (
        items: HuertaItemRepositoryPort,
        media: HuertaMediaStoragePort,
      ): DeleteHuertaItemUseCase => new DeleteHuertaItemUseCase(items, media),
      inject: [HUERTA_ITEM_REPOSITORY, HUERTA_MEDIA_STORAGE],
    },
    {
      provide: UPLOAD_HUERTA_MEDIA_USE_CASE,
      useFactory: (
        storage: HuertaMediaStoragePort,
      ): UploadHuertaMediaUseCase => new UploadHuertaMediaUseCase(storage),
      inject: [HUERTA_MEDIA_STORAGE],
    },
  ],
})
export class HuertaModule {}
