import { Pipe, PipeTransform } from '@angular/core';

import { marked } from 'marked';

/**
 * Markdown to HTML, for `[innerHTML]`. The HTML is returned as a string, not marked as trusted, so Angular's
 * sanitiser removes scripts, event handlers and `javascript:` links on the way in: the texts it draws are written
 * outside this repository, and markdown passes any HTML in them through (#2258).
 */
@Pipe({ name: 'markdownParse' })
export class MarkdownParsePipe implements PipeTransform {
  public transform(value: string): string {
    if (value) {
      // Synchronous, so a template gets the HTML itself: marked returns a promise only when asked to.
      return marked(value, { async: false });
    } else {
      return null;
    }
  }
}
