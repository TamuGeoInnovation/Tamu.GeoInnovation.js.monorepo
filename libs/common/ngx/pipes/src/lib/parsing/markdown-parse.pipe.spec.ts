import { Component, signal } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';

import { MarkdownParsePipe } from './markdown-parse.pipe';

/** Binds the pipe the way every caller does: AggieMap's popups and GIS Day's session, presenter and sponsor pages. */
@Component({
  template: `<div [innerHTML]="text() | markdownParse"></div>`,
  imports: [MarkdownParsePipe]
})
class HostComponent {
  public readonly text = signal('');
}

describe('MarkdownParsePipe', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [MarkdownParsePipe]
    }).compileComponents();
  });

  /**
   * Matches the shape of marked's output rather than an exact string. marked has varied its rendering
   * across versions -- trailing newlines, and generated heading ids -- so an equality check against
   * '<h1>Test</h1>' breaks on a dependency bump rather than on a real regression.
   */
  it('should generate markdown', inject([MarkdownParsePipe], (pipe: MarkdownParsePipe) => {
    expect(pipe.transform('# Test').trim()).toMatch(/^<h1[^>]*>Test<\/h1>$/);
  }));

  it('should return null for empty input', inject([MarkdownParsePipe], (pipe: MarkdownParsePipe) => {
    expect(pipe.transform('')).toBeNull();
  }));

  // The texts it draws are written in the GIS Day admin pages and in services outside this repository (AggieMap's
  // dining descriptions come from another department), and markdown passes HTML through. Angular's sanitiser must
  // still see the result, so a handler typed into a description never reaches the page (#2258).
  describe('bound with [innerHTML]', () => {
    const render = (text: string): HTMLElement => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.text.set(text);
      fixture.detectChanges();

      return fixture.nativeElement.querySelector('div');
    };

    it('strips event handlers and scripts from the HTML a description carries', () => {
      const div = render('Hours <img src="x" onerror="window.alert(1)"> today <script>window.alert(2)</script> **only**');

      expect(div.querySelector('[onerror]')).toBeNull();
      expect(div.querySelector('script')).toBeNull();
      expect(div.innerHTML).not.toContain('alert');
      expect(div.querySelector('strong').textContent).toBe('only');
    });

    it('strips javascript: links', () => {
      const div = render('[menu](javascript:window.alert(1))');

      expect(div.querySelector('a').getAttribute('href')).not.toMatch(/^javascript:/);
    });

    it('keeps the markdown and HTML the descriptions use', () => {
      const div = render(
        '<h4><strong>Aggie Ring Replica, 2009<br /></strong></h4><span>Located in the Haynes Ring Plaza</span>\n\n' +
          'Topics:\n\n- Services\n- [The map library](https://library.tamu.edu/)'
      );

      expect(div.querySelector('h4 strong').textContent).toBe('Aggie Ring Replica, 2009');
      expect(div.querySelector('h4 br')).not.toBeNull();
      expect(div.querySelector('span').textContent).toBe('Located in the Haynes Ring Plaza');
      expect(Array.from(div.querySelectorAll('li'), (li) => li.textContent)).toEqual(['Services', 'The map library']);
      expect(div.querySelector('a').getAttribute('href')).toBe('https://library.tamu.edu/');
    });
  });
});
