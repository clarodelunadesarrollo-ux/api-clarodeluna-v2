import { parseCloudinaryUrl } from './parse-cloudinary-url';

describe('parseCloudinaryUrl', () => {
  it('parses a signed authenticated image URL with a folder', () => {
    const url =
      'https://res.cloudinary.com/demo/image/authenticated/s--AbC123_--/v1790466563/huerta/abc123.jpg';

    expect(parseCloudinaryUrl(url)).toEqual({
      publicId: 'huerta/abc123',
      resourceType: 'image',
      deliveryType: 'authenticated',
    });
  });

  it('parses a signed authenticated video URL', () => {
    const url =
      'https://res.cloudinary.com/demo/video/authenticated/s--XyZ--/v123/huerta/clip.mp4';

    expect(parseCloudinaryUrl(url)).toEqual({
      publicId: 'huerta/clip',
      resourceType: 'video',
      deliveryType: 'authenticated',
    });
  });

  it('parses a public upload URL with transformations before the version', () => {
    const url =
      'https://res.cloudinary.com/demo/image/upload/w_1280,c_limit,q_auto/v1790466554/promos/pic.png';

    expect(parseCloudinaryUrl(url)).toEqual({
      publicId: 'promos/pic',
      resourceType: 'image',
      deliveryType: 'upload',
    });
  });

  it('parses a public upload URL without a version', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/cld-sample-4.jpg';

    expect(parseCloudinaryUrl(url)).toEqual({
      publicId: 'cld-sample-4',
      resourceType: 'image',
      deliveryType: 'upload',
    });
  });

  it('keeps nested folder paths in the public id', () => {
    const url =
      'https://res.cloudinary.com/demo/image/authenticated/v1/a/b/c/name.webp';

    expect(parseCloudinaryUrl(url)?.publicId).toBe('a/b/c/name');
  });

  it('returns null for non-Cloudinary URLs', () => {
    expect(parseCloudinaryUrl('https://example.com/image/upload/v1/x.jpg')).toBeNull();
  });

  it('returns null for malformed input', () => {
    expect(parseCloudinaryUrl('not a url')).toBeNull();
  });

  it('returns null when the resource type is unknown', () => {
    expect(
      parseCloudinaryUrl('https://res.cloudinary.com/demo/other/upload/v1/x.jpg'),
    ).toBeNull();
  });
});
