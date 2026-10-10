import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { marked } from 'marked';

@Pipe({ name: 'markdownParse' })
export class MarkdownParsePipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  public transform(value: string): SafeHtml {
    if (value) {
      const content = marked(value);

      return this.sanitizer.bypassSecurityTrustHtml(content);
    } else {
      return null;
    }
  }
}
