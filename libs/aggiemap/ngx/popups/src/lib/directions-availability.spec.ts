import * as fs from 'fs';
import * as path from 'path';

/**
 * No directions entry point is offered without the development-only gate (#1003).
 *
 * Routing is unpublished, so every "Directions To Here" button and every Directions sidebar tab in
 * AggieMap is shown on dev and localhost only. That holds only while each one is gated, and a new popup
 * copied from an old one would bring the button straight back. This reads every template AggieMap
 * renders popups and sidebars from and fails on any directions entry point without its gate:
 *
 * - a "Directions To Here" button needs `*ngIf="directionsAvailable | async"`, which every popup
 *   inherits from `BaseDirectionsComponent`;
 * - a Directions sidebar tab needs `(isDev | async) === true` in its `*ngIf`.
 *
 * The deployed sites are checked by `test/smoke/aggiemap/directions.spec.ts`. When routing returns,
 * make `directionsAvailable` true everywhere and remove the gates and this test together.
 */

const REPO_ROOT = path.join(__dirname, '..', '..', '..', '..', '..', '..');

/** Where AggieMap's popups and sidebars live: its own, and the event and parking maps'. */
const TEMPLATE_ROOTS = [
  'libs/aggiemap/ngx/popups/src',
  'libs/aggiemap/ngx/ui/desktop/src',
  'libs/aggiemap/ngx/ui/mobile/src',
  'libs/ts/events/ngx/src'
];

function templates(): string[] {
  return TEMPLATE_ROOTS.flatMap((root) =>
    (fs.readdirSync(path.join(REPO_ROOT, root), { recursive: true }) as string[])
      .filter((file) => file.endsWith('.html'))
      .map((file) => path.join(root, file))
  );
}

/**
 * Each element in a template whose text or tab title offers directions, as its opening tag plus text.
 * Commented-out markup is removed first; it renders nothing.
 */
function directionsElements(file: string): { tag: string; kind: 'button' | 'tab' }[] {
  const source = fs.readFileSync(path.join(REPO_ROOT, file), 'utf8').replace(/<!--[\s\S]*?-->/g, '');

  const buttons = [...source.matchAll(/<(\w[\w-]*)\b[^>]*>\s*Directions To Here\s*</g)].map((match) => ({
    tag: match[0],
    kind: 'button' as const
  }));

  const tabs = [...source.matchAll(/<tamu-gisc-sidebar-tab\b[^>]*\[title\]="'Directions'"[^>]*>/g)].map((match) => ({
    tag: match[0],
    kind: 'tab' as const
  }));

  return [...buttons, ...tabs];
}

describe('directions entry points while routing is unavailable', () => {
  const files = templates();

  it('finds the templates it checks', () => {
    // Guards the directory walk: if it found nothing, every check below would pass on nothing. There
    // were 39 when this was written.
    expect(files.length).toBeGreaterThan(30);
  });

  it('finds the directions entry points it checks', () => {
    // A parsing slip must not make this pass by finding none. At the time of #1003 there were eight
    // popup buttons and two sidebar tabs.
    const all = files.flatMap((file) => directionsElements(file));

    expect(all.filter((element) => element.kind === 'button').length).toBeGreaterThanOrEqual(8);
    expect(all.filter((element) => element.kind === 'tab').length).toBeGreaterThanOrEqual(2);
  });

  it('gates every "Directions To Here" button and Directions tab to development', () => {
    const ungated = files.flatMap((file) =>
      directionsElements(file)
        .filter(({ tag, kind }) =>
          kind === 'button' ? !/\*ngIf="directionsAvailable \| async"/.test(tag) : !/\(isDev \| async\) === true/.test(tag)
        )
        .map(({ tag }) => `${file}: ${tag.replace(/\s+/g, ' ').slice(0, 140)}`)
    );

    expect(ungated).toEqual([]);
  });
});
