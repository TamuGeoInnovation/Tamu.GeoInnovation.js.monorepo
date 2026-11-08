import * as fs from 'fs';
import * as path from 'path';

import { LayerSource } from '@tamu-gisc/common/types';
import { factory } from '@tamu-gisc/aggiemap/ngx/common';

import { EventDefinitions } from './all.definitions';

const OVERRIDES = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', 'test', 'smoke', 'aggiemap', 'layer-title-overrides.json');

/** One entry of `layer-title-overrides.json`. */
interface TitleOverride {
  /** Where the title is declared: an event map's id, or `main` for the layers every map loads. */
  map: string;
  layer: string;
  title: string;
  reason: string;
}

/** Layer types with no service to name them, which must carry a title of their own. */
const NO_SERVICE_NAME: ReadonlyArray<string> = ['group', 'graphics', 'geojson', 'csv'];

/** Every title a definition gives a layer its service could name, groups' children included. */
function titled(map: string, sources: LayerSource[]): TitleOverride[] {
  return sources.flatMap((source) => [
    ...(source.title !== undefined && !NO_SERVICE_NAME.includes(source.type)
      ? [{ map, layer: source.id, title: source.title, reason: '' }]
      : []),
    ...titled(map, (source as { sources?: LayerSource[] }).sources ?? [])
  ]);
}

/**
 * Every layer title that replaces the name its service publishes is declared, with a reason (#2731).
 *
 * A layer's name belongs to its service (`docs/map-layers.md`): a `title` in a definition means a rename upstream
 * never reaches the map. Some are right, and the reason goes in `layer-title-overrides.json`, which the smoke suite
 * also reads to check each override is still what the map shows. Without this test a title could be added with no
 * entry, and that drift is how 95 of them accumulated (#1508). Those already here when the list was made are marked
 * "unreviewed (#1523)" until #1523 works through them.
 */
describe('layer title overrides (#2731)', () => {
  const overrides: TitleOverride[] = JSON.parse(fs.readFileSync(OVERRIDES, 'utf8'));
  const main = factory({ environment: 'prod', includeDevelopmentOnly: true });
  const declared = [
    ...titled('main', [...main.LayerSources, ...main.ThreeDLayers]),
    ...EventDefinitions.flatMap((definition) =>
      titled(definition.configuration?.id ?? '', [...(definition.sources ?? []), ...(definition.developmentSources ?? [])])
    )
  ];
  const key = (entry: { map: string; layer: string }) => `${entry.map} ${entry.layer}`;

  it('list every title a definition sets, as the definition sets it', () => {
    const listed = new Map(overrides.map((entry) => [key(entry), entry.title]));

    expect(
      declared
        .filter((entry) => listed.get(key(entry)) !== entry.title)
        .map((entry) => `${key(entry)}: "${entry.title}"${listed.has(key(entry)) ? ` (listed as "${listed.get(key(entry))}")` : ''}`)
    ).toEqual([]);
  });

  it('list nothing a definition no longer sets', () => {
    const set = new Set(declared.map(key));

    expect(overrides.filter((entry) => !set.has(key(entry))).map(key)).toEqual([]);
  });

  it('give every entry a reason', () => {
    expect(overrides.filter((entry) => !entry.reason?.trim()).map(key)).toEqual([]);
  });
});
