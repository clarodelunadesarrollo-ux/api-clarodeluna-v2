import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RolesGuard } from '../../common/auth/roles.guard';
import { BOGOTA_CLOCK, BogotaClock } from '../../common/time/bogota-clock';
import { CREATE_MENU_DISH_USE_CASE } from './application/ports/in/create-menu-dish.port';
import { CREATE_MENU_SECTION_USE_CASE } from './application/ports/in/create-menu-section.port';
import { DELETE_MENU_DISH_USE_CASE } from './application/ports/in/delete-menu-dish.port';
import { DELETE_MENU_SECTION_USE_CASE } from './application/ports/in/delete-menu-section.port';
import { GET_MENU_USE_CASE } from './application/ports/in/get-menu.port';
import { LIST_ALL_MENU_SECTIONS_USE_CASE } from './application/ports/in/list-all-menu-sections.port';
import { UPDATE_MENU_DISH_USE_CASE } from './application/ports/in/update-menu-dish.port';
import { UPDATE_MENU_SECTION_USE_CASE } from './application/ports/in/update-menu-section.port';
import { UPLOAD_MENU_MEDIA_USE_CASE } from './application/ports/in/upload-menu-media.port';
import {
    MENU_DISH_REPOSITORY,
    MenuDishRepositoryPort,
} from './application/ports/out/menu-dish-repository.port';
import {
    MENU_MEDIA_STORAGE,
    MenuMediaStoragePort,
} from './application/ports/out/menu-media-storage.port';
import {
    MENU_SECTION_REPOSITORY,
    MenuSectionRepositoryPort,
} from './application/ports/out/menu-section-repository.port';
import {
    RESERVATION_CONTEXT,
    ReservationContextPort,
} from './application/ports/out/reservation-context.port';
import { CreateMenuDishUseCase } from './application/use-cases/create-menu-dish.use-case';
import { CreateMenuSectionUseCase } from './application/use-cases/create-menu-section.use-case';
import { DeleteMenuDishUseCase } from './application/use-cases/delete-menu-dish.use-case';
import { DeleteMenuSectionUseCase } from './application/use-cases/delete-menu-section.use-case';
import { GetMenuUseCase } from './application/use-cases/get-menu.use-case';
import { ListAllMenuSectionsUseCase } from './application/use-cases/list-all-menu-sections.use-case';
import { UpdateMenuDishUseCase } from './application/use-cases/update-menu-dish.use-case';
import { UpdateMenuSectionUseCase } from './application/use-cases/update-menu-section.use-case';
import { UploadMenuMediaUseCase } from './application/use-cases/upload-menu-media.use-case';
import { MenuDishPrismaRepository } from './infrastructure/persistence/repositories/menu-dish-prisma.repository';
import { MenuSectionPrismaRepository } from './infrastructure/persistence/repositories/menu-section-prisma.repository';
import { ReservationContextPrismaAdapter } from './infrastructure/persistence/repositories/reservation-context-prisma.adapter';
import { CloudinaryMenuMediaStorageAdapter } from './infrastructure/storage/cloudinary-menu-media-storage.adapter';
import { MenuDishesController } from './presentation/controllers/menu-dishes.controller';
import { MenuSectionsController } from './presentation/controllers/menu-sections.controller';
import { MenuController } from './presentation/controllers/menu.controller';

@Module({
  controllers: [MenuController, MenuSectionsController, MenuDishesController],
  providers: [
    RolesGuard,
    { provide: BOGOTA_CLOCK, useClass: BogotaClock },
    { provide: MENU_SECTION_REPOSITORY, useClass: MenuSectionPrismaRepository },
    { provide: MENU_DISH_REPOSITORY, useClass: MenuDishPrismaRepository },
    { provide: RESERVATION_CONTEXT, useClass: ReservationContextPrismaAdapter },
    {
      provide: MENU_MEDIA_STORAGE,
      useFactory: (
        config: ConfigService,
      ): CloudinaryMenuMediaStorageAdapter =>
        new CloudinaryMenuMediaStorageAdapter({
          cloudName: config.get<string>('CLOUDINARY_CLOUD_NAME'),
          apiKey: config.get<string>('CLOUDINARY_API_KEY'),
          apiSecret: config.get<string>('CLOUDINARY_API_SECRET'),
          folder: config.get<string>('CLOUDINARY_MENU_FOLDER') ?? 'menu',
        }),
      inject: [ConfigService],
    },
    {
      provide: GET_MENU_USE_CASE,
      useFactory: (
        context: ReservationContextPort,
        sections: MenuSectionRepositoryPort,
      ): GetMenuUseCase => new GetMenuUseCase(context, sections),
      inject: [RESERVATION_CONTEXT, MENU_SECTION_REPOSITORY],
    },
    {
      provide: LIST_ALL_MENU_SECTIONS_USE_CASE,
      useFactory: (
        sections: MenuSectionRepositoryPort,
      ): ListAllMenuSectionsUseCase =>
        new ListAllMenuSectionsUseCase(sections),
      inject: [MENU_SECTION_REPOSITORY],
    },
    {
      provide: CREATE_MENU_SECTION_USE_CASE,
      useFactory: (sections: MenuSectionRepositoryPort): CreateMenuSectionUseCase =>
        new CreateMenuSectionUseCase(sections),
      inject: [MENU_SECTION_REPOSITORY],
    },
    {
      provide: UPDATE_MENU_SECTION_USE_CASE,
      useFactory: (sections: MenuSectionRepositoryPort): UpdateMenuSectionUseCase =>
        new UpdateMenuSectionUseCase(sections),
      inject: [MENU_SECTION_REPOSITORY],
    },
    {
      provide: DELETE_MENU_SECTION_USE_CASE,
      useFactory: (sections: MenuSectionRepositoryPort): DeleteMenuSectionUseCase =>
        new DeleteMenuSectionUseCase(sections),
      inject: [MENU_SECTION_REPOSITORY],
    },
    {
      provide: CREATE_MENU_DISH_USE_CASE,
      useFactory: (
        dishes: MenuDishRepositoryPort,
        sections: MenuSectionRepositoryPort,
      ): CreateMenuDishUseCase => new CreateMenuDishUseCase(dishes, sections),
      inject: [MENU_DISH_REPOSITORY, MENU_SECTION_REPOSITORY],
    },
    {
      provide: UPDATE_MENU_DISH_USE_CASE,
      useFactory: (dishes: MenuDishRepositoryPort): UpdateMenuDishUseCase =>
        new UpdateMenuDishUseCase(dishes),
      inject: [MENU_DISH_REPOSITORY],
    },
    {
      provide: DELETE_MENU_DISH_USE_CASE,
      useFactory: (
        dishes: MenuDishRepositoryPort,
        media: MenuMediaStoragePort,
      ): DeleteMenuDishUseCase => new DeleteMenuDishUseCase(dishes, media),
      inject: [MENU_DISH_REPOSITORY, MENU_MEDIA_STORAGE],
    },
    {
      provide: UPLOAD_MENU_MEDIA_USE_CASE,
      useFactory: (storage: MenuMediaStoragePort): UploadMenuMediaUseCase =>
        new UploadMenuMediaUseCase(storage),
      inject: [MENU_MEDIA_STORAGE],
    },
  ],
})
export class MenuModule {}
