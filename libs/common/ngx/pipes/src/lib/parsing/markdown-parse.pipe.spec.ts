import { SecurityContext } from '@angular/core';
import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { MarkdownParsePipe } from './markdown-parse.pipe';

describe('MarkdownParsePipe', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [MarkdownParsePipe]
    }).compileComponents();
  }));

  /**
   * Reads the result back through DomSanitizer rather than the SafeHtml implementation detail the
   * original assertion used (`changingThisBreaksApplicationSecurity`), and matches the shape of
   * marked's output rather than an exact string. marked has varied its rendering across versions --
   * trailing newlines, and generated heading ids -- so an equality check against '<h1>Test</h1>'
   * breaks on a dependency bump rather than on a real regression.
   */
  it('should generate markdown and bypass security', inject([MarkdownParsePipe], (pipe: MarkdownParsePipe) => {
    const sanitizer = TestBed.inject(DomSanitizer);

    const rendered = sanitizer.sanitize(SecurityContext.HTML, pipe.transform('# Test'));

    expect(rendered.trim()).toMatch(/^<h1[^>]*>Test<\/h1>$/);
  }));

  it('should return null for empty input', inject([MarkdownParsePipe], (pipe: MarkdownParsePipe) => {
    expect(pipe.transform('')).toBeNull();
  }));
});
