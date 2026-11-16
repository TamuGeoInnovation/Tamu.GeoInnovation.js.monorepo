import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * #3143. On gisday.tamu.edu some links were still txgisday.org's blue, such as a session's slide file links beside a
 * maroon Remove: the shared `.inline-link` named its blue itself, and `--support-link-color` was never switched for the
 * Texas A&M brand. Every link colour on a GIS Day site comes from a custom property, and every link colour the main
 * site sets on `:root`, the Texas A&M brand sets too.
 */
describe('GIS Day link colours', () => {
  const styles = readFileSync(join(__dirname, 'styles.scss'), 'utf-8');

  /** The declarations directly inside the first block opened by `opening`, nested blocks left out. */
  function block(opening: string): string {
    const start = styles.indexOf(opening);

    expect(start).toBeGreaterThan(-1);

    let depth = 0;
    let body = '';

    for (let i = styles.indexOf('{', start); i < styles.length; i++) {
      const c = styles[i];

      if (c === '{') {
        depth++;
        if (depth === 1) continue;
      } else if (c === '}') {
        depth--;
        if (depth === 0) break;
      }

      if (depth === 1) {
        body += c;
      }
    }

    return body;
  }

  const names = (css: string) => [...css.matchAll(/(--[\w-]*link[\w-]*)\s*:/g)].map((m) => m[1]);

  it('gives the shared inline link its colour from a custom property, so a brand can change it', () => {
    expect(block('\n.inline-link {')).toMatch(/color:\s*var\(--/);
  });

  it('switches every link colour the main site sets for the Texas A&M brand', () => {
    const main = names(block('\n:root {'));
    const tamu = names(block('&.brand-tamu {'));

    expect(main.length).toBeGreaterThan(1);
    // `--link-color` follows `--gisday-primary-light`, which the brand switches, so it needs no line of its own.
    expect(main.filter((name) => name !== '--link-color' && !tamu.includes(name))).toEqual([]);
  });
});
