import { writeFile, readdir, mkdir, stat, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

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
  } catch {
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

    // The name is the browser's, which anyone can set: only its last part is used, so it cannot climb out of `path`
    // (CodeQL js/path-injection, #3776).
    const originalName = file.originalname.split(/[\\/]/).pop() ?? '';

    if (originalName === '' || originalName === '.' || originalName === '..') {
      throw new Error(`"${file.originalname}" is not a file name.`);
    }

    const parts = originalName.split('.');
    const fileExtension = parts.pop();
    const extensionLessName = parts.join('.');

    // Truncate the original file name to 50 characters, preserving the file extension
    const truncatedFileName =
      options?.truncateFileNameLength && options.truncateFileNameLength > 0
        ? extensionLessName.substring(0, options.truncateFileNameLength) + '.' + fileExtension
        : originalName;

    const fileName = truncatedFileName;

    let endFileName = `${fileName}`;

    if (options?.prefix) {
      endFileName = `${options.prefix}${endFileName}`;
    }

    if (options?.suffix) {
      endFileName = `${options.suffix}${endFileName}`;
    }

    const target = resolve(path, endFileName);

    // A prefix or suffix is the caller's own, but the written file still has to be in `path`.
    if (dirname(target) !== resolve(path)) {
      throw new Error(`"${endFileName}" would be written outside ${path}.`);
    }

    await writeFile(target, file.buffer);

    return `${endFileName}`;
  } catch (error) {
    throw new Error(`Error writing file to disk. ${error.message}`, { cause: error });
  }
}

/**
 * Deletes a file from disk.
 *
 * Resolves `true` when it removed the file, and `false` when there was no file there: an already-missing file is the
 * outcome the caller wanted, so it is not an error. Anything else (a directory, a permission error) is thrown.
 */
export async function deleteFileFromDisk(path: string): Promise<boolean> {
  try {
    await unlink(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

/**
 * Checks if provided path exists, if not, creates it.
 */
export async function ensureDirectoryExists(path: string) {
  // With fs promises, check if the directory exists, if not, create it
  try {
    return await readdir(path);
  } catch {
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
