import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * #2657. index.html always loaded Google's tag with `___G_TAG___` in it; the container fills that in when it starts,
 * but skips an empty `G_TAG`, so gisday.ucgis.org (no Analytics property yet) asked Google for the tag
 * `id=___G_TAG___` on every visit. The page now loads the tag only when it was given a real ID.
 */
describe('index.html, Google Analytics', () => {
  const html = readFileSync(join(__dirname, 'index.html'), 'utf8');

  /** Runs the page's inline scripts as the container would leave them, with `G_TAG` filled in or not. */
  function load(gTag: string | null) {
    document.head.innerHTML = '';
    delete (window as unknown as { dataLayer?: unknown }).dataLayer;

    const page = gTag === null ? html : html.split('___G_TAG___').join(gTag);
    const scripts = Array.from(new DOMParser().parseFromString(page, 'text/html').querySelectorAll('script'));

    // A script the page loads by address is what would ask Google; an inline one is run here as the browser would.
    const loadedByAddress = scripts.filter((s) => s.src).map((s) => s.getAttribute('src'));

    scripts.filter((s) => !s.src).forEach((s) => new Function(s.textContent ?? '')());

    const added = Array.from(document.head.querySelectorAll('script')).map((s) => s.getAttribute('src'));
    const dataLayer = (window as unknown as { dataLayer?: Array<IArguments> }).dataLayer ?? [];

    return {
      requests: [...loadedByAddress, ...added].filter((src) => src?.includes('googletagmanager')),
      configured: dataLayer.filter((a) => a[0] === 'config').map((a) => a[1])
    };
  }

  it('loads the tag and configures it when the site was given an ID', () => {
    const { requests, configured } = load('G-ABC123');

    expect(requests).toEqual(['https://www.googletagmanager.com/gtag/js?id=G-ABC123']);
    expect(configured).toEqual(['G-ABC123']);
  });

  it('asks Google for nothing when the ID was left unset, as on gisday.ucgis.org', () => {
    const { requests, configured } = load(null);

    expect(requests).toEqual([]);
    expect(configured).toEqual([]);
  });

  it('still defines gtag, so anything that calls it does not fail', () => {
    load(null);

    expect(typeof (window as unknown as { gtag?: unknown }).gtag).toBe('function');
  });
});
