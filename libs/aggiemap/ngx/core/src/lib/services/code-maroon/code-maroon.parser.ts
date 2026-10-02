import { CodeMaroonAlert } from './code-maroon.types';

/**
 * Turns the Code Maroon RSS document into alerts.
 *
 * Parsing is deliberately forgiving. No real alert item has been seen - the feed is empty between
 * alerts - so this reads the standard RSS 2.0 fields and keeps every other element it finds rather
 * than assuming a schema that may not match. An unrecognised field reaching the screen is a far
 * better failure than one quietly dropped during an emergency.
 */

const KNOWN = ['title', 'description', 'link', 'pubdate', 'guid'];

function text(item: Element, tag: string): string | undefined {
  const node = Array.from(item.children).find((child) => child.tagName.toLowerCase() === tag);

  return node?.textContent?.trim() || undefined;
}

/**
 * RFC 822 is what RSS specifies, and `Date` parses it. A feed that sends something else should not
 * cost us the alert, so an unparseable date is dropped and the rest is kept.
 */
function published(raw: string | undefined): Date | undefined {
  if (!raw) {
    return undefined;
  }

  const parsed = new Date(raw);

  return isNaN(parsed.getTime()) ? undefined : parsed;
}

export function parseCodeMaroonFeed(xml: string): CodeMaroonAlert[] {
  const document = new DOMParser().parseFromString(xml, 'text/xml');

  // `parsererror` is how DOMParser reports malformed input; it throws nothing.
  if (document.getElementsByTagName('parsererror').length > 0) {
    throw new Error('The Code Maroon feed did not parse as XML');
  }

  return Array.from(document.getElementsByTagName('item')).map((item) => {
    const extra: Record<string, string> = {};

    Array.from(item.children).forEach((child) => {
      const tag = child.tagName.toLowerCase();
      const value = child.textContent?.trim();

      if (!KNOWN.includes(tag) && value) {
        extra[child.tagName] = value;
      }
    });

    return {
      title: text(item, 'title') || 'Code Maroon alert',
      description: text(item, 'description') || '',
      link: text(item, 'link'),
      published: published(text(item, 'pubdate')),
      guid: text(item, 'guid'),
      extra
    };
  });
}
