import { VrExperience } from '../../domain/entities/vr-experience.entity';
import { VrExperienceNotFoundException } from '../../domain/exceptions/vr-experience-not-found.exception';
import { VrExperienceRepositoryPort } from '../ports/out/vr-experience-repository.port';
import { GetVrExperienceUseCase } from './get-vr-experience.use-case';

const experience = (): VrExperience =>
  VrExperience.rehydrate({
    id: 'vr1',
    title: 'Recorrido',
    videoUrl: 'https://cdn.example.com/video.mp4',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('GetVrExperienceUseCase', () => {
  let experiences: { findCurrent: jest.Mock; saveCurrent: jest.Mock };
  let useCase: GetVrExperienceUseCase;

  beforeEach(() => {
    experiences = { findCurrent: jest.fn(), saveCurrent: jest.fn() };
    useCase = new GetVrExperienceUseCase(
      experiences as unknown as VrExperienceRepositoryPort,
    );
  });

  it('returns the current experience', async () => {
    const current = experience();
    experiences.findCurrent.mockResolvedValue(current);
    await expect(useCase.execute()).resolves.toBe(current);
  });

  it('throws when no experience is configured', async () => {
    experiences.findCurrent.mockResolvedValue(null);
    await expect(useCase.execute()).rejects.toBeInstanceOf(
      VrExperienceNotFoundException,
    );
  });
});
