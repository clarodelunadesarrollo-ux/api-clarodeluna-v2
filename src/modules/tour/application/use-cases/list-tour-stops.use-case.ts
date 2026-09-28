import { TourStop } from '../../domain/entities/tour-stop.entity';
import { ListTourStopsUseCasePort } from '../ports/in/list-tour-stops.port';
import { TourStopRepositoryPort } from '../ports/out/tour-stop-repository.port';

export class ListTourStopsUseCase implements ListTourStopsUseCasePort {
  constructor(private readonly stops: TourStopRepositoryPort) {}

  execute(): Promise<TourStop[]> {
    return this.stops.findAllActiveOrdered();
  }
}
