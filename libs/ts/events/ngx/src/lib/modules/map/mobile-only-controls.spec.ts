import * as fs from 'fs';
import * as path from 'path';

/**
 * No control routes somewhere only the mobile map can reach, unless it is gated to mobile (#1251).
 *
 * The event and Ring Day maps carried two overlay buttons - a Legend and a Layer List - pointing at
 * `m/sidebar/legend` and `m/sidebar/layers`. Those routes are declared under the map module's `m`
 * branch and nowhere else, so on a desktop map the router could not resolve them and fell back to the
 * root map: clicking a mystery icon silently threw away the map the user was looking at. They sat
 * under the desktop side panel as well, which already offers Layers and Legend properly.
 *
 * Written as a scan rather than against those two buttons, because the fault is a class of mistake -
 * a mobile-branch route offered on a surface that is not mobile - and the next instance would arrive
 * by someone copying a neighbouring line.
 *
 * Commented-out markup is stripped first: it renders nothing, and AggieMap's own map template keeps a
 * disabled `routerLink="/map/m/bus"` that is not a fault.
 */

function repoRoot(): string {
  let dir = __dirname;

  while (!fs.existsSync(path.join(dir, 'nx.json'))) {
    const parent = path.dirname(dir);

    if (parent === dir) {
      throw new Error('Could not locate the workspace root from ' + __dirname);
    }

    dir = parent;
  }

  return dir;
}

const ROOT = repoRoot();

/** The map templates that render an overlay of controls over the map canvas. */
const TEMPLATES = [
  'libs/ts/events/ngx/src/lib/modules/map/map.component.html',
  'libs/ts/ringday/ngx/src/lib/modules/map/map.component.html',
  'libs/aggiemap/ngx/core/src/lib/pages/map/map.component.html'
];

/** Opening tags carrying a routerLink, with comments removed. */
function elementsWithRouterLink(template: string): string[] {
  const markup = template.replace(/<!--[\s\S]*?-->/g, '');

  return (markup.match(/<[a-zA-Z][^>]*routerLink[^>]*>/g) ?? []).map((tag) => tag.replace(/\s+/g, ' '));
}

/**
 * Whether a routerLink target can only be resolved under the mobile (`m`) branch.
 *
 * Matches `./m/...`, `/map/m/...` and `m/...`, and deliberately not a path that merely contains the
 * letter m, such as `/all-maps`.
 */
function isMobileOnlyTarget(tag: string): boolean {
  const target = tag.match(/routerLink="([^"]*)"/)?.[1];

  if (target === undefined) {
    return false;
  }

  return target.split('/').includes('m');
}

function isGatedToMobile(tag: string): boolean {
  const gate = tag.match(/\*ngIf="([^"]*)"/)?.[1];

  return gate !== undefined && /\bisMobile\b/.test(gate) && !/!\s*isMobile/.test(gate);
}

describe('mobile-only map controls', () => {
  it('finds the templates it is meant to be reading', () => {
    // A path that stops resolving would make every assertion below pass vacuously.
    TEMPLATES.forEach((file) => {
      expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
    });
  });

  it.each(TEMPLATES)('offers no ungated mobile-only route in %s', (file) => {
    const template = fs.readFileSync(path.join(ROOT, file), 'utf8');

    const ungated = elementsWithRouterLink(template)
      .filter(isMobileOnlyTarget)
      .filter((tag) => !isGatedToMobile(tag));

    // Anything listed here routes to the mobile branch without an isMobile gate. On a desktop map the
    // router cannot resolve those, and falls back to the root map.
    expect(ungated).toEqual([]);
  });

  it('still recognises a mobile-only target, so the scan is not passing vacuously', () => {
    const ungated = '<div routerLink="./m/sidebar/layers" class="x">';
    const gated = '<div *ngIf="isMobile" routerLink="./m/sidebar/layers" class="x">';

    expect(isMobileOnlyTarget(ungated)).toBe(true);
    expect(isGatedToMobile(ungated)).toBe(false);
    expect(isGatedToMobile(gated)).toBe(true);
  });

  it('does not mistake an ordinary route for a mobile-only one', () => {
    expect(isMobileOnlyTarget('<a routerLink="/all-maps">')).toBe(false);
    expect(isMobileOnlyTarget('<a routerLink="../builder/review">')).toBe(false);
    expect(isMobileOnlyTarget('<a routerLink="/map/d/settings">')).toBe(false);
  });

  it('ignores commented-out markup', () => {
    const template = '<!-- <div routerLink="/map/m/bus"></div> --><a routerLink="/all-maps"></a>';

    expect(elementsWithRouterLink(template)).toEqual(['<a routerLink="/all-maps">']);
  });

  it('does not count a negated mobile gate as gated to mobile', () => {
    expect(isGatedToMobile('<div *ngIf="!isMobile" routerLink="./m/sidebar/layers">')).toBe(false);
  });
});
