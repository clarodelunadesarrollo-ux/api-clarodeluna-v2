import { ReadState } from '../../application/ports/in/get-client-read-state.port';

export class ReadStateResponseDto {
  readonly partnerLastReadAt: string | null;

  constructor(state: ReadState) {
    this.partnerLastReadAt = state.partnerLastReadAt
      ? state.partnerLastReadAt.toISOString()
      : null;
  }
}
