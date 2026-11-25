/**
 * @jest-environment-options {"customExportConditions": ["node", "require"]}
 */
// The Node build of Sass, which compiles from files; jsdom would otherwise resolve its browser build. Not the node
// environment: zone.js, which this project's test setup loads, then breaks Node's MessagePort and Jest exits 1.
import * as fs from 'fs';
import * as path from 'path';
import { compile, Logger } from 'sass';

/**
 * No GIS Day component colours a button of its own (#2946).
 *
 * A GIS Day site's buttons take one colour, the site's: `--gisday-action` in `apps/gisday-angular/src/styles.scss`,
 * read by the global `.button` and by the shared `tamu-gisc-button`. A component that sets a button's colour
 * itself is a button that stays that colour on every site; the submission page's two outlined buttons were a
 * dark red on txgisday.org's blue site. Layout (margins, padding, display) is the component's business; colour
 * is not.
 *
 * Every component stylesheet under `libs/gisday` is compiled, and every rule that styles a button itself (its
 * last selector part is a `.button` or a `tamu-gisc-button`, not something inside one) is checked for a colour.
 */

const REPO_ROOT = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..');
const GISDAY = path.join(REPO_ROOT, 'libs', 'gisday');

const COLOUR_PROPERTIES =
  /^(color|background|background-color|border|border-color|border-(top|right|bottom|left)(-color)?)$/;
// A colour written into the rule, rather than taken from the site (`var(...)`) or switched off (`none`).
const COLOUR_VALUE = /#[0-9a-f]{3,8}\b|\b(rgba?|hsla?)\(|\b(white|black|red|maroon|blue)\b/i;

function stylesheets(): string[] {
  return (fs.readdirSync(GISDAY, { recursive: true }) as string[])
    .filter((file) => file.endsWith('.component.scss'))
    .map((file) => path.join(GISDAY, file));
}

/** Rules that style a button itself, as `selector { declarations }`, with their colour declarations. */
function buttonColours(file: string): string[] {
  const css = compile(file, { loadPaths: [REPO_ROOT], logger: Logger.silent }).css;
  const found: string[] = [];
  // Innermost blocks only: a rule inside @media is matched without the @media around it.
  for (const [, selectors, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const styled = selectors
      .split(',')
      .map(
        (selector) =>
          selector
            .trim()
            .split(/[\s>+~]+/)
            .pop() ?? ''
      )
      .some((last) => /\.button(?![\w-])|^tamu-gisc-button(?![\w-])/.test(last));
    if (!styled) {
      continue;
    }
    for (const declaration of body.split(';')) {
      const [property, ...value] = declaration.split(':');
      if (COLOUR_PROPERTIES.test(property.trim()) && COLOUR_VALUE.test(value.join(':'))) {
        found.push(`${selectors.trim()} { ${declaration.trim()} }`);
      }
    }
  }
  return found;
}

describe('GIS Day button colours', () => {
  it('finds the component stylesheets', () => {
    expect(stylesheets().length).toBeGreaterThan(50);
  });

  it('leaves every button the site colour', () => {
    const coloured = stylesheets().flatMap((file) =>
      buttonColours(file).map((rule) => `${path.relative(REPO_ROOT, file).replace(/\\/g, '/')}: ${rule}`)
    );
    expect(coloured).toEqual([]);
  });
});
