import { TourStop } from '../../domain/entities/tour-stop.entity';
import { TourStopNotFoundException } from '../../domain/exceptions/tour-stop-not-found.exception';
import {
    UpdateTourStopCommand,
    UpdateTourStopUseCasePort,
} from '../ports/in/update-tour-stop.port';
import {
    TourStopRepositoryPort,
    UpdateTourStopData,
} from '../ports/out/tour-stop-repository.port';

export class UpdateTourStopUseCase implements UpdateTourStopUseCasePort {
  constructor(private readonly stops: TourStopRepositoryPort) {}

  async execute(id: string, command: UpdateTourStopCommand): Promise<TourStop> {
    const current = await this.stops.findById(id);
    if (current === null) {
      throw new TourStopNotFoundException();
    }

    // Validate the resulting stop as a whole (current values merged with the
    // provided changes) so invariants hold regardless of which fields change.
    const merged = TourStop.validate({
      order: command.order ?? current.order,
      title: command.title ?? current.title,
      description: command.description ?? current.description,
      positionX: command.positionX ?? current.positionX,
      positionY: command.positionY ?? current.positionY,
      active: command.active ?? current.active,
    });

    const changes: UpdateTourStopData = {};
    if (command.order !== undefined) changes.order = merged.order;
    if (command.title !== undefined) changes.title = merged.title;
    if (command.description !== undefined) changes.description = merged.description;
    if (command.positionX !== undefined) changes.positionX = merged.positionX;
    if (command.positionY !== undefined) changes.positionY = merged.positionY;
    if (command.active !== undefined) changes.active = merged.active;

    return this.stops.update(id, changes);
  }
}
