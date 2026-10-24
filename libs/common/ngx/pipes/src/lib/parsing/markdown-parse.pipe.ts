import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { marked } from 'marked';

@Pipe({ name: 'markdownParse' })
export class MarkdownParsePipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  public transform(value: string): SafeHtml {
    if (value) {
      // Synchronous, so a template gets the HTML itself: marked returns a promise only when asked to.
      const content = marked(value, { async: false });

      return this.sanitizer.bypassSecurityTrustHtml(content);
    } else {
      return null;
    }
  }
}
