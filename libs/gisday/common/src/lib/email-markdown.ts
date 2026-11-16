import { Marked, Tokens } from 'marked';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escape = (text: string) => text.replace(/[&<>"]/g, (c) => ESCAPES[c]);

/** Only these links are made links; any other, such as `javascript:`, keeps its text and loses the link. */
const SAFE_LINK = /^(https?:|mailto:)/i;

/**
 * The editable emails' Markdown (#3044): GitHub's flavour, with a line break kept as one. HTML typed into the text is
 * shown as written, never obeyed, and only web and email links are links. Markdown does its own escaping, so an
 * address with `&` in it stays whole.
 */
const markdown = new Marked({
  gfm: true,
  breaks: true,
  async: false,
  renderer: {
    html(token: Tokens.HTML | Tokens.Tag) {
      return escape(token.text);
    },
    link(token: Tokens.Link) {
      const text = this.parser.parseInline(token.tokens);

      return SAFE_LINK.test(token.href) ? `<a href="${escape(token.href)}">${text}</a>` : text;
    }
  }
});

/**
 * An editable email's text as HTML (#3044): the profile, acceptance and final-reminder emails may use Markdown, such as
 * **bold**, *italic*, [a link](https://...) and lists, and go out as this HTML beside their plain text. The same function
 * draws the window's preview, so it shows what arrives.
 */
export function emailHtml(text: string): string {
  return markdown.parse(text ?? '') as string;
}
