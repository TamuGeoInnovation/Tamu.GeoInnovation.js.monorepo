// @vitest-environment node
import * as path from 'path';
import { compile, compileString, Logger } from 'sass';

/**
 * The shared button takes its colour from the page's `--gisday-action` tokens, and keeps its own blue where a
 * page has none (#2946).
 *
 * A GIS Day site sets its button colour once, in `apps/gisday-angular/src/styles.scss`: blue on txgisday.org,
 * maroon on Texas A&M's. Every other application that uses this button (AggieMap, GeoServices, the event maps)
 * defines no such token, so each fallback must be exactly the colour the button had before, or they all change.
 * That is what this checks, on the stylesheet as Sass compiles it; `test/e2e/gisday/button-colours.spec.ts`
 * checks what a GIS Day site draws.
 */

const REPO_ROOT = path.join(__dirname, '..', '..', '..', '..', '..', '..', '..', '..');
const STYLESHEET = path.join(__dirname, 'button.component.scss');

// The colours the button drew before #2946, which every application without the token must still get.
const BEFORE = `
$color: rgba(85, 138, 216, 1);
a {
  color: $color;
  hover: darken($color, 10%);
  active: darken($color, 25%);
}`;

function compiled(css: string) {
  return css.replace(/\s+/g, ' ');
}

/** The declarations of the rule whose selector is exactly `selector`, in compiled CSS. */
function rule(css: string, selector: string): Record<string, string> {
  const found = new RegExp(`(?:^|[}\\s])${selector.replace(/[.*+?^${}()|[\]\\:]/g, '\\$&')} \\{([^}]*)\\}`).exec(css);
  expect(found, `no rule for ${selector}`).not.toBeNull();
  return Object.fromEntries(
    (found?.[1] ?? '')
      .split(';')
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .map((declaration) => {
        const colon = declaration.indexOf(':');
        return [declaration.slice(0, colon).trim(), declaration.slice(colon + 1).trim()];
      })
  );
}

describe('ButtonComponent styles', () => {
  const options = { loadPaths: [REPO_ROOT], logger: Logger.silent };
  const css = compiled(compile(STYLESHEET, options).css);
  const before = rule(compiled(compileString(BEFORE, options).css), 'a');
  const action = `var(--gisday-action, ${before['color']})`;
  const hover = `var(--gisday-action-hover, ${before['hover']})`;

  it('fills with the site colour, or the blue it always had', () => {
    expect(rule(css, ':host')['background']).toBe(action);
  });

  it('darkens to the site hover colour, or the darker blue it always had', () => {
    expect(rule(css, ':host:hover')['background']).toBe(hover);
    // A GIS Day site has no pressed colour of its own; its hover colour is the nearest it has.
    expect(rule(css, ':host:active')['background']).toBe(`var(--gisday-action-hover, ${before['active']})`);
  });

  it('outlines a secondary button in the site colour', () => {
    const secondary = rule(css, ':host.secondary');
    expect(secondary['border']).toBe(`1.5pt solid ${action}`);
    expect(secondary['color']).toBe(action);
    expect(rule(css, ':host.secondary:hover')['border-color']).toBe(hover);
  });

  // #2969: a small button for a lesser action beside a field, and the regular one left as it was.
  it('makes a small button smaller than the regular one, and leaves the regular one as it was', () => {
    expect(rule(css, ':host.small input')).toEqual({ padding: '0.35rem 0.75rem', 'font-size': '0.8rem' });
    // The rule for `input` on its own, after the host's rules; `rule()` would find `:host.small input` first.
    expect(css).toMatch(/\} input \{[^}]*padding: 0\.9rem 1rem;/);
  });
});
