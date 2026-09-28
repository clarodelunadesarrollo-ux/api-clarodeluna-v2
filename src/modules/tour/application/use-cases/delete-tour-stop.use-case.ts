import { TourStopNotFoundException } from '../../domain/exceptions/tour-stop-not-found.exception';
import { DeleteTourStopUseCasePort } from '../ports/in/delete-tour-stop.port';
import { TourStopRepositoryPort } from '../ports/out/tour-stop-repository.port';

export class DeleteTourStopUseCase implements DeleteTourStopUseCasePort {
  constructor(private readonly stops: TourStopRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const current = await this.stops.findById(id);
    if (current === null) {
      throw new TourStopNotFoundException();
    }
    await this.stops.delete(id);
  }
}
