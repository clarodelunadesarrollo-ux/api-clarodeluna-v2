import { Module } from '@nestjs/common';

import { CREATE_TOUR_STOP_USE_CASE } from './application/ports/in/create-tour-stop.port';
import { DELETE_TOUR_STOP_USE_CASE } from './application/ports/in/delete-tour-stop.port';
import { GET_TOUR_STOP_USE_CASE } from './application/ports/in/get-tour-stop.port';
import { LIST_TOUR_STOPS_USE_CASE } from './application/ports/in/list-tour-stops.port';
import { UPDATE_TOUR_STOP_USE_CASE } from './application/ports/in/update-tour-stop.port';
import {
    TOUR_STOP_REPOSITORY,
    TourStopRepositoryPort,
} from './application/ports/out/tour-stop-repository.port';
import { CreateTourStopUseCase } from './application/use-cases/create-tour-stop.use-case';
import { DeleteTourStopUseCase } from './application/use-cases/delete-tour-stop.use-case';
import { GetTourStopUseCase } from './application/use-cases/get-tour-stop.use-case';
import { ListTourStopsUseCase } from './application/use-cases/list-tour-stops.use-case';
import { UpdateTourStopUseCase } from './application/use-cases/update-tour-stop.use-case';
import { TourStopPrismaRepository } from './infrastructure/persistence/repositories/tour-stop-prisma.repository';
import { TourStopsController } from './presentation/controllers/tour-stops.controller';

@Module({
  controllers: [TourStopsController],
  providers: [
    { provide: TOUR_STOP_REPOSITORY, useClass: TourStopPrismaRepository },
    {
      provide: LIST_TOUR_STOPS_USE_CASE,
      useFactory: (stops: TourStopRepositoryPort): ListTourStopsUseCase =>
        new ListTourStopsUseCase(stops),
      inject: [TOUR_STOP_REPOSITORY],
    },
    {
      provide: GET_TOUR_STOP_USE_CASE,
      useFactory: (stops: TourStopRepositoryPort): GetTourStopUseCase =>
        new GetTourStopUseCase(stops),
      inject: [TOUR_STOP_REPOSITORY],
    },
    {
      provide: CREATE_TOUR_STOP_USE_CASE,
      useFactory: (stops: TourStopRepositoryPort): CreateTourStopUseCase =>
        new CreateTourStopUseCase(stops),
      inject: [TOUR_STOP_REPOSITORY],
    },
    {
      provide: UPDATE_TOUR_STOP_USE_CASE,
      useFactory: (stops: TourStopRepositoryPort): UpdateTourStopUseCase =>
        new UpdateTourStopUseCase(stops),
      inject: [TOUR_STOP_REPOSITORY],
    },
    {
      provide: DELETE_TOUR_STOP_USE_CASE,
      useFactory: (stops: TourStopRepositoryPort): DeleteTourStopUseCase =>
        new DeleteTourStopUseCase(stops),
      inject: [TOUR_STOP_REPOSITORY],
    },
  ],
})
export class TourModule {}
