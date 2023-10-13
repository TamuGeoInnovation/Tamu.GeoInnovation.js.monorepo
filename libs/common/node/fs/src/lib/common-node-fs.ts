import { writeFile, readdir, mkdir, stat } from 'node:fs/promises';

export function commonNodeFs(): string {
  return 'common-node-fs';
}

/**
 * Checks if a file exists at the provided path.
 *
 * `stat` will throw an error if the file does not exist, so we catch it and return false.
 */
export async function fileExists(fileName: string) {
  try {
    await stat(fileName);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Writes a file to disk at the provided path. Ensures that the directory exists before writing.
 *
 * Returns the file name that was written.
 *
 * @param {string} path Write path/folder
 * @param {{ buffer: Buffer; originalname: string }} file The file to be written. Extension is preserved.
 * @param {WriteFileToDiskOptions} [options] Optional options for writing the file.
 */
export async function writeFileToDisk(
  path: string,
  file: Express.Multer.File,
  options?: WriteFileToDiskOptions
): Promise<string> {
  try {
    await ensureDirectoryExists(path);

    const parts = file.originalname.split('.');
    const fileExtension = parts.pop();
    const extensionLessName = parts.join('.');

    // Truncate the original file name to 50 characters, preserving the file extension
    const truncatedFileName =
      options.truncateFileNameLength && options.truncateFileNameLength > 0
        ? extensionLessName.substring(0, options.truncateFileNameLength) + '.' + fileExtension
        : file.originalname;

    const fileName = truncatedFileName;

    let endFileName = `${fileName}`;

    if (options?.prefix) {
      endFileName = `${options.prefix}${endFileName}`;
    }

    if (options?.suffix) {
      endFileName = `${options.suffix}${endFileName}`;
    }

    await writeFile(`${path}/${endFileName}`, file.buffer);

    return `${endFileName}`;
  } catch (error) {
    throw new Error(`Error writing file to disk. ${error.message}`);
  }
}

/**
 * Checks if provided path exists, if not, creates it.
 */
export async function ensureDirectoryExists(path: string) {
  // With fs promises, check if the directory exists, if not, create it
  try {
    return await readdir(path);
  } catch (error) {
    // Directory doesn't exist, create it
    return await mkdir(path, { recursive: true });
  }
}

export interface WriteFileToDiskOptions {
  /**
   * A prefix to prepend to the file name AFTER any truncation.
   */
  prefix?: string;

  /**
   *
   * A suffix to append to the file name AFTER any truncation.
   */
  suffix?: string;

  /**
   * The maximum length of the file name, excluding the file extension.
   *
   * If not provided, the file name will not be truncated.
   */
  truncateFileNameLength?: number;
}
