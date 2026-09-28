import { HuertaItemType } from '../enums/huerta-item-type.enum';
import { InvalidHuertaItemException } from '../exceptions/invalid-huerta-item.exception';
import { HuertaItem } from './huerta-item.entity';

describe('HuertaItem.validate', () => {
  const base = {
    title: 'Riego',
    mediaUrl: 'https://res.cloudinary.com/demo/x.mp4',
    description: null,
    order: 0,
    active: true,
  };

  it('requires a poster for VIDEO items', () => {
    expect(() =>
      HuertaItem.validate({ ...base, type: HuertaItemType.VIDEO, posterUrl: null }),
    ).toThrow(InvalidHuertaItemException);
  });

  it('keeps the poster for VIDEO items', () => {
    const result = HuertaItem.validate({
      ...base,
      type: HuertaItemType.VIDEO,
      posterUrl: 'https://res.cloudinary.com/demo/poster.jpg',
    });
    expect(result.posterUrl).toBe('https://res.cloudinary.com/demo/poster.jpg');
  });

  it('drops the poster for IMAGE items', () => {
    const result = HuertaItem.validate({
      ...base,
      type: HuertaItemType.IMAGE,
      posterUrl: 'https://res.cloudinary.com/demo/ignored.jpg',
    });
    expect(result.posterUrl).toBeNull();
  });

  it('trims the title and rejects an empty one', () => {
    expect(() =>
      HuertaItem.validate({
        ...base,
        type: HuertaItemType.IMAGE,
        title: '   ',
        posterUrl: null,
      }),
    ).toThrow(InvalidHuertaItemException);
  });

  it('rejects a negative order', () => {
    expect(() =>
      HuertaItem.validate({
        ...base,
        type: HuertaItemType.IMAGE,
        order: -1,
        posterUrl: null,
      }),
    ).toThrow(InvalidHuertaItemException);
  });
});
