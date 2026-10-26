/**
 * Resizes the speaker photos already stored, the way an upload now is (#2352): in place, under the same names, so no
 * database row changes.
 *
 * A dry run by default: it lists every photo with its size before and after, and writes nothing. With --apply it first copies
 * every photo it will change into the backup folder (an earlier copy there is never replaced, so the first original survives
 * a re-run), then writes the new ones. Run it again and the photos it already did are reported as already small.
 *
 *   nx run gisday-nest:fit-speaker-photos                       the uploads' images/speakers under APP_DATA, dry run
 *   nx run gisday-nest:fit-speaker-photos --dir=<folder>         another folder
 *   nx run gisday-nest:fit-speaker-photos --dir=<folder> --apply
 *   nx run gisday-nest:fit-speaker-photos --apply --backup=<folder>   default: <dir>-originals beside it
 *
 * On production the maintainer runs it against the uploads volume, after a dry run. The originals stay in the backup
 * folder until he deletes them.
 */
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

import { fitImage } from '@tamu-gisc/common/node/images';
import { SPEAKER_PHOTO_FIT } from '@tamu-gisc/gisday/platform/data-api';

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const apply = process.argv.includes('--apply');
const dir = resolve(arg('dir') ?? join(process.env.APP_DATA ?? '', 'images/speakers'));
const backup = resolve(arg('backup') ?? `${dir}-originals`);
const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

async function main() {
  const names = (await readdir(dir, { withFileTypes: true })).filter((e) => e.isFile()).map((e) => e.name).sort();
  const results = [];

  for (const name of names) {
    const input = await readFile(join(dir, name));
    results.push({ name, ...(await fitImage(input, SPEAKER_PHOTO_FIT)) });
  }

  for (const r of results) {
    const before = `${r.before.width} x ${r.before.height}, ${kb(r.before.bytes)}`;
    const after = r.changed ? `${r.after.width} x ${r.after.height}, ${kb(r.after.bytes)}` : 'unchanged';
    console.log(`${r.changed ? 'CHANGE' : 'keep  '}  ${name(r.name)}  ${before}  ->  ${after}  (${r.reason})`);
  }

  const changing = results.filter((r) => r.changed);
  const total = (key: 'before' | 'after') => results.reduce((sum, r) => sum + r[key].bytes, 0);
  console.log(`\n${results.length} files in ${dir}; ${changing.length} to change; ${kb(total('before'))} now, ${kb(total('after'))} after.`);

  if (!apply) {
    console.log('Dry run: nothing written. Run again with --apply to write.');
    return;
  }

  // Every original is copied aside before any photo is written, so a failure part way leaves nothing without a copy.
  await mkdir(backup, { recursive: true });
  for (const r of changing) {
    const copy = join(backup, r.name);
    const exists = await stat(copy).then(() => true, () => false);
    if (!exists) await copyFile(join(dir, r.name), copy);
  }

  for (const r of changing) {
    await writeFile(join(dir, r.name), r.buffer);
  }

  console.log(`Wrote ${changing.length} files. Originals are in ${backup}.`);
}

// File names up to 60 characters, padded so the sizes line up.
function name(n: string) {
  return (n.length > 60 ? `${n.slice(0, 57)}...` : n).padEnd(60);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
