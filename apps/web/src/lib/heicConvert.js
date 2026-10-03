// iPhone photos are HEIC/HEIF, which Chrome/Firefox/Edge can't decode —
// so they can't be previewed, compressed via <canvas>, or shown to buyers.
// Convert them to JPEG in the browser before they enter any upload flow.

const HEIC_EXT = /\.(heic|heif)$/i;

// macOS/Chrome often report an empty `type` for .heic files, so the
// extension is checked too.
export const isHeicFile = (file) =>
  Boolean(file) && (/image\/hei[cf]/i.test(file.type) || HEIC_EXT.test(file.name || ''));

/**
 * Returns a JPEG File for a HEIC/HEIF input, or the input unchanged for any
 * other file. The converter (a WASM build of libheif) is loaded only when a
 * HEIC file actually shows up, so it never weighs down normal page loads.
 */
export const convertHeicToJpeg = async (file) => {
  if (!isHeicFile(file)) return file;
  const { heicTo } = await import('heic-to');
  const blob = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.9 });
  const name = (file.name || 'photo').replace(HEIC_EXT, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
};

// File-input `accept` value for photo pickers that should also allow HEIC.
export const IMAGE_ACCEPT_WITH_HEIC = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';
