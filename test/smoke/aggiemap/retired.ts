import * as fs from 'fs';
import * as path from 'path';

/**
 * What is retired (#1098), read from the source.
 *
 * An event that is over is marked `status: 'retired'` in its definition: it is listed nowhere, and
 * the smoke suite does not test it. The definitions cannot be imported here - they pull in Angular,
 * see global-setup.ts - so they are read as text. The marker and the configuration's `id` and `name`
 * are literals in every definition file, which is what this relies on.
 */

const REPO_ROOT = path.join(__dirname, '..', '..', '..');
const DEFINITIONS = path.join(REPO_ROOT, 'libs', 'ts', 'events', 'ngx', 'src', 'lib', 'definitions');
const RETIRED_MARKER = /\bstatus:\s*'retired'/;

export interface RetiredMap {
  id: string;
  name: string;
  file: string;
}

/** Every retired map, from its definition's `EventConfiguration`. */
export function retiredMaps(): RetiredMap[] {
  return fs
    .readdirSync(DEFINITIONS)
    .filter((file) => file.endsWith('.definitions.ts'))
    .map((file) => ({ file, source: fs.readFileSync(path.join(DEFINITIONS, file), 'utf8') }))
    .filter(({ source }) => RETIRED_MARKER.test(source))
    .map(({ file, source }) => {
      const configuration = source.match(/: EventConfiguration = \{\r?\n\s+id: '([^']+)',\r?\n\s+name: '([^']+)'/);

      if (!configuration) {
        throw new Error(`${file} is marked retired but its EventConfiguration id and name could not be read.`);
      }

      return { id: configuration[1], name: configuration[2], file };
    });
}

/**
 * Connections used only by retired maps, each with the files that use it.
 *
 * Every non-spec file under libs/ and apps/ that names a connection (`Connections.x` or
 * `connections.x`) is found, and a connection counts as retired only when every one of those files is
 * marked retired. A service shared with a current map is still checked.
 */
export function retiredConnections(): Map<string, string[]> {
  const usedBy = new Map<string, { retired: string[]; current: number }>();

  for (const root of ['libs', 'apps']) {
    const files = fs.readdirSync(path.join(REPO_ROOT, root), { recursive: true }) as string[];

    for (const relative of files) {
      if (!relative.endsWith('.ts') || relative.endsWith('.spec.ts') || relative.endsWith('connections.ts')) {
        continue;
      }

      const file = path.join(REPO_ROOT, root, relative);
      const source = fs.readFileSync(file, 'utf8');
      const names = new Set([...source.matchAll(/\b[Cc]onnections\.(\w+)/g)].map((match) => match[1]));

      if (names.size === 0) {
        continue;
      }

      const retired = RETIRED_MARKER.test(source);

      for (const name of names) {
        const entry = usedBy.get(name) ?? { retired: [], current: 0 };

        if (retired) {
          entry.retired.push(path.basename(file));
        } else {
          entry.current += 1;
        }

        usedBy.set(name, entry);
      }
    }
  }

  return new Map(
    [...usedBy]
      .filter(([, entry]) => entry.retired.length > 0 && entry.current === 0)
      .map(([name, entry]) => [name, entry.retired])
  );
}
