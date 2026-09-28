import { HuertaItem } from '../../domain/entities/huerta-item.entity';
import { NoActiveHuertaContextException } from '../../domain/exceptions/no-active-huerta-context.exception';
import { GetHuertaUseCasePort } from '../ports/in/get-huerta.port';
import { HuertaAccessPort } from '../ports/out/huerta-access.port';
import { HuertaItemRepositoryPort } from '../ports/out/huerta-item-repository.port';

export class GetHuertaUseCase implements GetHuertaUseCasePort {
  constructor(
    private readonly access: HuertaAccessPort,
    private readonly items: HuertaItemRepositoryPort,
  ) {}

  async execute(userId: string): Promise<HuertaItem[]> {
    const hasCheckedIn = await this.access.hasCheckedInToday(userId);
    if (!hasCheckedIn) {
      throw new NoActiveHuertaContextException();
    }
    return this.items.findActiveOrdered();
  }
}
