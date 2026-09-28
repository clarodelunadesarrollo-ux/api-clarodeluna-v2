import {
    buildMenuSection,
    createFakeMenuSectionRepository,
    FakeMenuSectionRepository,
} from './__testing__/menu.fixtures';
import { ListAllMenuSectionsUseCase } from './list-all-menu-sections.use-case';

describe('ListAllMenuSectionsUseCase', () => {
  let sections: FakeMenuSectionRepository;
  let useCase: ListAllMenuSectionsUseCase;

  beforeEach(() => {
    sections = createFakeMenuSectionRepository();
    useCase = new ListAllMenuSectionsUseCase(sections);
  });

  it('returns all sections with their dishes from the repository', async () => {
    const all = [
      buildMenuSection({ id: '11111111-1111-1111-1111-111111111111' }),
      buildMenuSection({ id: '33333333-3333-3333-3333-333333333333' }),
    ];
    sections.findAllWithDishes.mockResolvedValue(all);

    const result = await useCase.execute();

    expect(result).toBe(all);
    expect(sections.findAllWithDishes).toHaveBeenCalledTimes(1);
  });
});
