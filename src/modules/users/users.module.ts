import { Module } from '@nestjs/common';

import {
    DELETE_ALL_CLIENTS_USE_CASE,
} from './application/ports/in/delete-all-clients.port';
import { DELETE_CLIENT_USE_CASE } from './application/ports/in/delete-client.port';
import { LIST_CLIENTS_USE_CASE } from './application/ports/in/list-clients.port';
import {
    CLIENT_REPOSITORY,
    ClientRepositoryPort,
} from './application/ports/out/client-repository.port';
import { DeleteAllClientsUseCase } from './application/use-cases/delete-all-clients.use-case';
import { DeleteClientUseCase } from './application/use-cases/delete-client.use-case';
import { ListClientsUseCase } from './application/use-cases/list-clients.use-case';
import { ClientPrismaRepository } from './infrastructure/persistence/repositories/client-prisma.repository';
import { UsersAdminController } from './presentation/controllers/users-admin.controller';

@Module({
  controllers: [UsersAdminController],
  providers: [
    { provide: CLIENT_REPOSITORY, useClass: ClientPrismaRepository },
    {
      provide: LIST_CLIENTS_USE_CASE,
      useFactory: (clients: ClientRepositoryPort): ListClientsUseCase =>
        new ListClientsUseCase(clients),
      inject: [CLIENT_REPOSITORY],
    },
    {
      provide: DELETE_CLIENT_USE_CASE,
      useFactory: (clients: ClientRepositoryPort): DeleteClientUseCase =>
        new DeleteClientUseCase(clients),
      inject: [CLIENT_REPOSITORY],
    },
    {
      provide: DELETE_ALL_CLIENTS_USE_CASE,
      useFactory: (clients: ClientRepositoryPort): DeleteAllClientsUseCase =>
        new DeleteAllClientsUseCase(clients),
      inject: [CLIENT_REPOSITORY],
    },
  ],
})
export class UsersModule {}
