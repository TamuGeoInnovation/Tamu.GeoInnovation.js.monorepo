/**
 * Default ceilings for multipart uploads handled by Nest/Multer. Logo and photo
 * routes take one 5 MiB image, enough for typical resized assets while limiting
 * the memory used by Multer's in-memory file buffers. The field limits also
 * bound text-only multipart requests; routes can raise file limits to preserve
 * an existing endpoint contract or allow several email attachments.
 */
export const DEFAULT_UPLOAD_LIMITS = Object.freeze({
  fileSize: 5 * 1024 * 1024,
  files: 1,
  fields: 50,
  fieldNameSize: 100,
  fieldSize: 1024 * 1024,
  parts: 51
});
