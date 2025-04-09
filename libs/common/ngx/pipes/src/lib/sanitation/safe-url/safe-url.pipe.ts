import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private readonly domSanitizer: DomSanitizer) {}

  public transform(url: string, type: 'resource' | 'url' = 'url'): SafeResourceUrl {
    if (!url) {
      return null;
    }

    if (type === 'resource') {
      return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    }

    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }
}
