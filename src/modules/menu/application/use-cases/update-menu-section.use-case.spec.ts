import { MenuSectionNotFoundException } from '../../domain/exceptions/menu-section-not-found.exception';
import {
    buildMenuSection,
    createFakeMenuSectionRepository,
    FakeMenuSectionRepository,
} from './__testing__/menu.fixtures';
import { UpdateMenuSectionUseCase } from './update-menu-section.use-case';

describe('UpdateMenuSectionUseCase', () => {
  let sections: FakeMenuSectionRepository;
  let useCase: UpdateMenuSectionUseCase;

  const id = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    sections = createFakeMenuSectionRepository();
    useCase = new UpdateMenuSectionUseCase(sections);
  });

  it('throws MenuSectionNotFoundException when the section does not exist', async () => {
    sections.findById.mockResolvedValue(null);

    await expect(useCase.execute(id, { title: 'Nuevo' })).rejects.toBeInstanceOf(
      MenuSectionNotFoundException,
    );
    expect(sections.update).not.toHaveBeenCalled();
  });

  it('only forwards the provided changes after validating the merged result', async () => {
    sections.findById.mockResolvedValue(buildMenuSection({ id, title: 'Entradas' }));
    sections.update.mockResolvedValue(buildMenuSection({ id, title: 'Aperitivos' }));

    await useCase.execute(id, { title: '  Aperitivos  ' });

    expect(sections.update).toHaveBeenCalledWith(id, { title: 'Aperitivos' });
  });
});
