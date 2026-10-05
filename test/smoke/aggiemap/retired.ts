import * as fs from 'fs';
import * as path from 'path';

import { DEFINITIONS_DIR, REPO_ROOT, RETIRED_MARKER, parseDefinition } from './definitions';

/**
 * What is retired (#1098), read from the source.
 *
 * An event that is over is marked `status: 'retired'` in its definition: it is listed nowhere, and
 * the smoke suite does not test it. The definitions cannot be imported here - they pull in Angular,
 * see global-setup.ts - so they are read as text, by `definitions.ts`, which the scoped smoke run
 * shares (#1427).
 */

export interface RetiredMap {
  id: string;
  name: string;
  file: string;
  /** Root-relative route, e.g. `/events/troubadour-festival-2025`. */
  route: string;
}

/** Every retired map, from its definition's `EventConfiguration`. */
export function retiredMaps(): RetiredMap[] {
  return fs
    .readdirSync(DEFINITIONS_DIR)
    .filter((file) => file.endsWith('.definitions.ts'))
    .map((file) => ({ file, source: fs.readFileSync(path.join(DEFINITIONS_DIR, file), 'utf8') }))
    .filter(({ source }) => RETIRED_MARKER.test(source))
    .map(({ file, source }) => {
      const parsed = parseDefinition(file, source);

      // Deliberately an error rather than a skip: a retired map whose configuration cannot be read
      // would otherwise be quietly left in the suite, which is the fault #1098 existed to stop.
      if (!parsed) {
        throw new Error(`${file} is marked retired but its EventConfiguration id and name could not be read.`);
      }

      return { id: parsed.id, name: parsed.name, file: parsed.file, route: parsed.route };
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
