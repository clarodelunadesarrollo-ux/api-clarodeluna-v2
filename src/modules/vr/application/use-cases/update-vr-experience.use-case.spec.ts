import { VrExperience } from '../../domain/entities/vr-experience.entity';
import { InvalidVrExperienceException } from '../../domain/exceptions/invalid-vr-experience.exception';
import { VrExperienceRepositoryPort } from '../ports/out/vr-experience-repository.port';
import { UpdateVrExperienceUseCase } from './update-vr-experience.use-case';

const experience = (): VrExperience =>
  VrExperience.rehydrate({
    id: 'vr1',
    title: 'Recorrido',
    videoUrl: 'https://cdn.example.com/video.mp4',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('UpdateVrExperienceUseCase', () => {
  let experiences: { findCurrent: jest.Mock; saveCurrent: jest.Mock };
  let useCase: UpdateVrExperienceUseCase;

  beforeEach(() => {
    experiences = { findCurrent: jest.fn(), saveCurrent: jest.fn() };
    useCase = new UpdateVrExperienceUseCase(
      experiences as unknown as VrExperienceRepositoryPort,
    );
  });

  it('validates then persists trimmed attributes', async () => {
    const saved = experience();
    experiences.saveCurrent.mockResolvedValue(saved);

    const result = await useCase.execute({
      title: '  Nuevo recorrido  ',
      videoUrl: '  https://cdn.example.com/new.mp4  ',
    });

    expect(experiences.saveCurrent).toHaveBeenCalledWith({
      title: 'Nuevo recorrido',
      videoUrl: 'https://cdn.example.com/new.mp4',
    });
    expect(result).toBe(saved);
  });

  it('rejects an invalid video URL before persistence', async () => {
    await expect(
      useCase.execute({ title: 'Recorrido', videoUrl: 'not-a-url' }),
    ).rejects.toBeInstanceOf(InvalidVrExperienceException);
    expect(experiences.saveCurrent).not.toHaveBeenCalled();
  });
});
