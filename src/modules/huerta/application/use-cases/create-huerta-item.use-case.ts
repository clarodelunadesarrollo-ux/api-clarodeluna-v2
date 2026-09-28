import { HuertaItem } from '../../domain/entities/huerta-item.entity';
import {
    CreateHuertaItemCommand,
    CreateHuertaItemUseCasePort,
} from '../ports/in/create-huerta-item.port';
import { HuertaItemRepositoryPort } from '../ports/out/huerta-item-repository.port';

export class CreateHuertaItemUseCase implements CreateHuertaItemUseCasePort {
  constructor(private readonly items: HuertaItemRepositoryPort) {}

  async execute(command: CreateHuertaItemCommand): Promise<HuertaItem> {
    const attributes = HuertaItem.validate({
      type: command.type,
      title: command.title,
      description: command.description ?? null,
      mediaUrl: command.mediaUrl,
      posterUrl: command.posterUrl ?? null,
      order: command.order,
      active: command.active ?? true,
    });
    return this.items.create(attributes);
  }
}
