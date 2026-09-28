export class SlotsResponseDto {
  readonly slots: string[];

  constructor(slots: string[]) {
    this.slots = slots;
  }
}
