import { MarkdownParsePipe } from './markdown-parse.pipe';
import { async, inject, TestBed } from '@angular/core/testing';

describe('MarkdownParsePipe', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [MarkdownParsePipe]
    }).compileComponents();
  }));

  it('should generate markdown and bypass security', inject([MarkdownParsePipe], (pipe: MarkdownParsePipe) => {
    expect(pipe.transform('# Test')).toEqual({ changingThisBreaksApplicationSecurity: '<h1>Test</h1>' });
  }));
});
