import * as fs from 'fs';
import * as path from 'path';

/**
 * #2965. Save, Create and Delete in the shared admin forms go back to the list through the page they are on, which
 * each admin details page provides as AdminDetailsPage. Angular does not pass BaseAdminDetailsPageComponent's providers
 * on to the pages extending it, so each page names itself. One that forgot would still work, silently: its form would
 * fall back to the bare list, which is the bug this fixed. So every page extending the base is checked here.
 */
describe('Every admin details page', () => {
  const PAGES = path.join(__dirname, '..');

  function sources(dir: string): Array<string> {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return sources(full);
      }

      return entry.name.endsWith('.component.ts') ? [full] : [];
    });
  }

  const pages = sources(PAGES)
    .map((file) => ({ file, text: fs.readFileSync(file, 'utf8') }))
    .map(({ file, text }) => ({
      file: path.relative(PAGES, file).split(path.sep).join('/'),
      text,
      // At the start of a line: not the example in the base's own documentation.
      name: /^export class (\w+) extends BaseAdminDetailsPageComponent\b/m.exec(text)?.[1]
    }))
    .filter((page) => page.name !== undefined);

  it('is found', () => {
    // The tag, event, speaker and other add and edit pages, the season's edit page, the review and speaker edits.
    expect(pages.length).toBeGreaterThanOrEqual(20);
  });

  it.each(pages.map((page) => [page.file, page]))('%s provides itself as the AdminDetailsPage', (_file, page) => {
    expect(page.text).toContain(`provideAdminDetailsPage(() => ${page.name})`);
  });
});
