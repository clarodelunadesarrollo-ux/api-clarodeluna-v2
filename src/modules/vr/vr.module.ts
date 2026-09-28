import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { GET_VR_EXPERIENCE_USE_CASE } from './application/ports/in/get-vr-experience.port';
import { UPDATE_VR_EXPERIENCE_USE_CASE } from './application/ports/in/update-vr-experience.port';
import { UPLOAD_VR_VIDEO_USE_CASE } from './application/ports/in/upload-vr-video.port';
import {
    VR_EXPERIENCE_REPOSITORY,
    VrExperienceRepositoryPort,
} from './application/ports/out/vr-experience-repository.port';
import {
    VR_VIDEO_STORAGE,
    VrVideoStoragePort,
} from './application/ports/out/vr-video-storage.port';
import { GetVrExperienceUseCase } from './application/use-cases/get-vr-experience.use-case';
import { UpdateVrExperienceUseCase } from './application/use-cases/update-vr-experience.use-case';
import { UploadVrVideoUseCase } from './application/use-cases/upload-vr-video.use-case';
import { VrExperiencePrismaRepository } from './infrastructure/persistence/repositories/vr-experience-prisma.repository';
import { CloudinaryVrVideoStorageAdapter } from './infrastructure/storage/cloudinary-vr-video-storage.adapter';
import { VrAdminController } from './presentation/controllers/vr-admin.controller';
import { VrController } from './presentation/controllers/vr.controller';

@Module({
  controllers: [VrController, VrAdminController],
  providers: [
    {
      provide: VR_EXPERIENCE_REPOSITORY,
      useClass: VrExperiencePrismaRepository,
    },
    {
      provide: VR_VIDEO_STORAGE,
      useFactory: (config: ConfigService): CloudinaryVrVideoStorageAdapter =>
        new CloudinaryVrVideoStorageAdapter({
          cloudName: config.get<string>('CLOUDINARY_CLOUD_NAME'),
          apiKey: config.get<string>('CLOUDINARY_API_KEY'),
          apiSecret: config.get<string>('CLOUDINARY_API_SECRET'),
          folder: config.get<string>('CLOUDINARY_VR_FOLDER') ?? 'vr',
        }),
      inject: [ConfigService],
    },
    {
      provide: GET_VR_EXPERIENCE_USE_CASE,
      useFactory: (
        experiences: VrExperienceRepositoryPort,
      ): GetVrExperienceUseCase => new GetVrExperienceUseCase(experiences),
      inject: [VR_EXPERIENCE_REPOSITORY],
    },
    {
      provide: UPDATE_VR_EXPERIENCE_USE_CASE,
      useFactory: (
        experiences: VrExperienceRepositoryPort,
      ): UpdateVrExperienceUseCase => new UpdateVrExperienceUseCase(experiences),
      inject: [VR_EXPERIENCE_REPOSITORY],
    },
    {
      provide: UPLOAD_VR_VIDEO_USE_CASE,
      useFactory: (storage: VrVideoStoragePort): UploadVrVideoUseCase =>
        new UploadVrVideoUseCase(storage),
      inject: [VR_VIDEO_STORAGE],
    },
  ],
})
export class VrModule {}
