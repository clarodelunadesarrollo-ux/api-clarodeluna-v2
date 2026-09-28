import { TourStop } from '../../domain/entities/tour-stop.entity';
import {
    CreateTourStopCommand,
    CreateTourStopUseCasePort,
} from '../ports/in/create-tour-stop.port';
import { TourStopRepositoryPort } from '../ports/out/tour-stop-repository.port';

export class CreateTourStopUseCase implements CreateTourStopUseCasePort {
  constructor(private readonly stops: TourStopRepositoryPort) {}

  async execute(command: CreateTourStopCommand): Promise<TourStop> {
    const attributes = TourStop.validate({
      order: command.order,
      title: command.title,
      description: command.description,
      positionX: command.positionX,
      positionY: command.positionY,
      active: command.active ?? true,
    });
    return this.stops.create(attributes);
  }
}
