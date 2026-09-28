import { HuertaItem } from '../../domain/entities/huerta-item.entity';
import { ListAllHuertaItemsUseCasePort } from '../ports/in/list-all-huerta-items.port';
import { HuertaItemRepositoryPort } from '../ports/out/huerta-item-repository.port';

export class ListAllHuertaItemsUseCase implements ListAllHuertaItemsUseCasePort {
  constructor(private readonly items: HuertaItemRepositoryPort) {}

  execute(): Promise<HuertaItem[]> {
    return this.items.findAllOrdered();
  }
}
