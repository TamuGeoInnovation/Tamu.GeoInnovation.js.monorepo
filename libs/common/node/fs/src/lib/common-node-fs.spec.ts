import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { commonNodeFs, deleteFileFromDisk, writeFileToDisk } from './common-node-fs';

describe('commonNodeFs', () => {
  it('should work', () => {
    expect(commonNodeFs()).toEqual('common-node-fs');
  });
});

describe('deleteFileFromDisk', () => {
  const dir = mkdtempSync(join(tmpdir(), 'common-node-fs-'));

  it('removes the file and says so', async () => {
    const file = join(dir, 'logo.png');
    writeFileSync(file, 'x');

    await expect(deleteFileFromDisk(file)).resolves.toBe(true);
    expect(existsSync(file)).toBe(false);
  });

  /** A file that is already gone is the outcome the caller wanted, so it is not an error. */
  it('answers false, without throwing, for a file that does not exist', async () => {
    await expect(deleteFileFromDisk(join(dir, 'never-written.png'))).resolves.toBe(false);
  });

  it('throws for anything else, such as a directory', async () => {
    await expect(deleteFileFromDisk(dir)).rejects.toThrow();
  });
});

describe('writeFileToDisk', () => {
  const dir = mkdtempSync(join(tmpdir(), 'common-node-fs-write-'));
  const file = { originalname: 'a-rather-long-file-name.png', buffer: Buffer.from('x') } as Express.Multer.File;

  /** The options are optional (#3495): without them the file is written under its own name, not refused. */
  it('writes the file under its own name when given no options', async () => {
    await expect(writeFileToDisk(dir, file)).resolves.toBe('a-rather-long-file-name.png');
    expect(readFileSync(join(dir, 'a-rather-long-file-name.png'), 'utf8')).toBe('x');
  });

  it('truncates the name, keeping the extension, when asked', async () => {
    await expect(writeFileToDisk(dir, file, { truncateFileNameLength: 6 })).resolves.toBe('a-rath.png');
  });
});
