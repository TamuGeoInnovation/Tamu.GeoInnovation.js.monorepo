import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import snarkdown from 'snarkdown';

@Pipe({
  name: 'markdownParse'
})
export class MarkdownParsePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  public transform(value: string): SafeHtml {
    const content = snarkdown(value);

    return this.sanitizer.bypassSecurityTrustHtml(snarkdown(content));
  }
}
