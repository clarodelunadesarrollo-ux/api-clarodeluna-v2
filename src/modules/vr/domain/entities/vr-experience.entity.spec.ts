import { InvalidVrExperienceException } from '../exceptions/invalid-vr-experience.exception';
import { VrExperience } from './vr-experience.entity';

describe('VrExperience.validate', () => {
  it('trims and returns valid attributes', () => {
    const result = VrExperience.validate({
      title: '  Recorrido  ',
      videoUrl: '  https://cdn.example.com/video.mp4  ',
    });
    expect(result).toEqual({
      title: 'Recorrido',
      videoUrl: 'https://cdn.example.com/video.mp4',
    });
  });

  it('rejects an empty title', () => {
    expect(() =>
      VrExperience.validate({
        title: '   ',
        videoUrl: 'https://cdn.example.com/video.mp4',
      }),
    ).toThrow(InvalidVrExperienceException);
  });

  it('rejects a non-http(s) video URL', () => {
    expect(() =>
      VrExperience.validate({
        title: 'Recorrido',
        videoUrl: 'ftp://cdn.example.com/video.mp4',
      }),
    ).toThrow(InvalidVrExperienceException);
  });

  it('rejects a malformed video URL', () => {
    expect(() =>
      VrExperience.validate({ title: 'Recorrido', videoUrl: 'not-a-url' }),
    ).toThrow(InvalidVrExperienceException);
  });
});
