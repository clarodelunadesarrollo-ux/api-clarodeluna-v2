import { TourStop } from '../../domain/entities/tour-stop.entity';
import { TourStopNotFoundException } from '../../domain/exceptions/tour-stop-not-found.exception';
import { GetTourStopUseCasePort } from '../ports/in/get-tour-stop.port';
import { TourStopRepositoryPort } from '../ports/out/tour-stop-repository.port';

export class GetTourStopUseCase implements GetTourStopUseCasePort {
  constructor(private readonly stops: TourStopRepositoryPort) {}

  async execute(id: string): Promise<TourStop> {
    const stop = await this.stops.findById(id);
    if (stop === null) {
      throw new TourStopNotFoundException();
    }
    return stop;
  }
}
