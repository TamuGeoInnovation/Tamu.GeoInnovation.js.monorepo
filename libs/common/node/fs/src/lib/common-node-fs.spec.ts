import { existsSync, mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { commonNodeFs, deleteFileFromDisk } from './common-node-fs';

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
