import { MenuSectionNotFoundException } from '../../domain/exceptions/menu-section-not-found.exception';
import {
    buildMenuSection,
    createFakeMenuSectionRepository,
    FakeMenuSectionRepository,
} from './__testing__/menu.fixtures';
import { DeleteMenuSectionUseCase } from './delete-menu-section.use-case';

describe('DeleteMenuSectionUseCase', () => {
  let sections: FakeMenuSectionRepository;
  let useCase: DeleteMenuSectionUseCase;

  const id = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    sections = createFakeMenuSectionRepository();
    useCase = new DeleteMenuSectionUseCase(sections);
  });

  it('throws MenuSectionNotFoundException when the section does not exist', async () => {
    sections.findById.mockResolvedValue(null);

    await expect(useCase.execute(id)).rejects.toBeInstanceOf(
      MenuSectionNotFoundException,
    );
    expect(sections.delete).not.toHaveBeenCalled();
  });

  it('deletes an existing section', async () => {
    sections.findById.mockResolvedValue(buildMenuSection({ id }));

    await useCase.execute(id);

    expect(sections.delete).toHaveBeenCalledWith(id);
  });
});
