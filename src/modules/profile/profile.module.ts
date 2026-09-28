import { Module } from '@nestjs/common';

import {
    GET_PROFILE_USE_CASE,
} from './application/ports/in/get-profile.port';
import {
    UPDATE_PROFILE_USE_CASE,
} from './application/ports/in/update-profile.port';
import {
    PROFILE_REPOSITORY,
    ProfileRepositoryPort,
} from './application/ports/out/profile-repository.port';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { ProfilePrismaRepository } from './infrastructure/persistence/repositories/profile-prisma.repository';
import { ProfileController } from './presentation/controllers/profile.controller';

@Module({
  controllers: [ProfileController],
  providers: [
    { provide: PROFILE_REPOSITORY, useClass: ProfilePrismaRepository },
    {
      provide: GET_PROFILE_USE_CASE,
      useFactory: (profiles: ProfileRepositoryPort): GetProfileUseCase =>
        new GetProfileUseCase(profiles),
      inject: [PROFILE_REPOSITORY],
    },
    {
      provide: UPDATE_PROFILE_USE_CASE,
      useFactory: (profiles: ProfileRepositoryPort): UpdateProfileUseCase =>
        new UpdateProfileUseCase(profiles),
      inject: [PROFILE_REPOSITORY],
    },
  ],
})
export class ProfileModule {}
