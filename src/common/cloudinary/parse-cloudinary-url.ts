export interface ParsedCloudinaryAsset {
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  deliveryType: string;
}

const RESOURCE_TYPES = new Set(['image', 'video', 'raw']);
const SIGNATURE_PATTERN = /^s--[A-Za-z0-9_-]+--$/;
const VERSION_PATTERN = /^v\d+$/;

// Extracts the pieces needed to delete a Cloudinary asset (public id, resource
// type and delivery type) from a delivery URL. Cloudinary URLs follow the shape
// `/<cloud>/<resourceType>/<deliveryType>/<signature?>/<transformations?>/v<version>/<publicId>.<ext>`.
// The version segment always precedes the public id, so everything after it is
// the public id path. Returns null when the URL is not a Cloudinary asset.
export function parseCloudinaryUrl(url: string): ParsedCloudinaryAsset | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.hostname !== 'res.cloudinary.com') {
    return null;
  }

  const segments = parsed.pathname
    .split('/')
    .filter((segment) => segment.length > 0);

  // Expected: [cloudName, resourceType, deliveryType, ...rest].
  if (segments.length < 4) {
    return null;
  }

  const [, resourceType, deliveryType, ...rest] = segments;
  if (!RESOURCE_TYPES.has(resourceType)) {
    return null;
  }

  const versionIndex = rest.findIndex((segment) =>
    VERSION_PATTERN.test(segment),
  );
  const publicIdSegments =
    versionIndex >= 0
      ? rest.slice(versionIndex + 1)
      : rest.filter(
          (segment) =>
            !SIGNATURE_PATTERN.test(segment) && !segment.includes(','),
        );

  if (publicIdSegments.length === 0) {
    return null;
  }

  const lastIndex = publicIdSegments.length - 1;
  const last = publicIdSegments[lastIndex];
  const dotIndex = last.lastIndexOf('.');
  publicIdSegments[lastIndex] = dotIndex > 0 ? last.slice(0, dotIndex) : last;

  return {
    publicId: publicIdSegments.join('/'),
    resourceType: resourceType as 'image' | 'video' | 'raw',
    deliveryType,
  };
}
