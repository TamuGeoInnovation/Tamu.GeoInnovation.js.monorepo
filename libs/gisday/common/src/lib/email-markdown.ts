import { marked } from 'marked';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

/**
 * An editable email's text as HTML (#3044): the profile, acceptance and final-reminder emails may use Markdown, such as
 * **bold**, *italic*, [a link](https://...) and lists, and go out as this HTML beside their plain text. HTML typed into
 * the text is escaped first, so it shows as written and is never obeyed: only Markdown formats. A line break is kept as
 * one, and a bare address becomes a link. The same function draws the window's preview, so it shows what arrives.
 */
export function emailHtml(text: string): string {
  const escaped = (text ?? '').replace(/[&<>]/g, (c) => ESCAPES[c]);

  return marked.parse(escaped, { async: false, gfm: true, breaks: true }) as string;
}
