import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrCodeComponent, qrModules, qrPath } from './qr-code.component';

describe('QrCodeComponent', () => {
  let fixture: ComponentFixture<QrCodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [QrCodeComponent] });
    fixture = TestBed.createComponent(QrCodeComponent);
  });

  it('draws the code as a labelled image, its box the size of the code', () => {
    fixture.componentRef.setInput('text', 'https://gisday.tamu.edu/sessions/details/e-1?checkin=abc');
    fixture.componentRef.setInput('label', 'Check-in QR code');
    fixture.detectChanges();

    const svg: SVGElement = fixture.nativeElement.querySelector('svg');
    const size = fixture.componentInstance.modules().size;

    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Check-in QR code');
    expect(svg.getAttribute('viewBox')).toBe(`0 0 ${size} ${size}`);
    expect(svg.querySelector('path').getAttribute('d')).toMatch(/^M\d+ \d+h1v1h-1z/);
  });

  it('offers a download only when given a file name', () => {
    fixture.componentRef.setInput('text', 'x');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tamu-gisc-button')).toBeNull();

    fixture.componentRef.setInput('downloadName', 'check-in');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tamu-gisc-button')).not.toBeNull();
  });

  describe('full screen', () => {
    const buttons = () =>
      Array.from<HTMLInputElement>(fixture.nativeElement.querySelectorAll('tamu-gisc-button input')).map((b) => b.value);
    const press = (label: string) => {
      Array.from<HTMLInputElement>(fixture.nativeElement.querySelectorAll('tamu-gisc-button input'))
        .find((b) => b.value === label)
        .click();
      fixture.detectChanges();
    };
    // jsdom has no Fullscreen API: the browser's side is stood in for here.
    const setFullscreenElement = (element: Element | null) => {
      Object.defineProperty(document, 'fullscreenElement', { value: element, configurable: true });
      document.dispatchEvent(new Event('fullscreenchange'));
      fixture.detectChanges();
    };

    let requestFullscreen: ReturnType<typeof vi.fn>;
    let exitFullscreen: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      requestFullscreen = vi.fn().mockResolvedValue(undefined);
      exitFullscreen = vi.fn().mockResolvedValue(undefined);
      (fixture.nativeElement as HTMLElement).requestFullscreen = requestFullscreen;
      Object.defineProperty(document, 'exitFullscreen', { value: exitFullscreen, configurable: true });

      fixture.componentRef.setInput('text', 'x');
      fixture.componentRef.setInput('caption', 'Scan to check in');
    });

    afterEach(() => {
      Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
    });

    it('is offered only when asked for', () => {
      fixture.detectChanges();
      expect(buttons()).not.toContain('Full screen');

      fixture.componentRef.setInput('fullscreen', true);
      fixture.detectChanges();
      expect(buttons()).toContain('Full screen');
    });

    it('fills the screen with the code itself, not the page', () => {
      fixture.componentRef.setInput('fullscreen', true);
      fixture.detectChanges();

      press('Full screen');

      expect(requestFullscreen).toHaveBeenCalledTimes(1);
    });

    it('shows the caption and a way out in full screen, and nothing else', () => {
      fixture.componentRef.setInput('fullscreen', true);
      fixture.componentRef.setInput('downloadName', 'check-in');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Scan to check in');

      setFullscreenElement(fixture.nativeElement);

      expect(fixture.nativeElement.textContent).toContain('Scan to check in');
      expect(buttons()).toEqual(['Exit full screen']);

      press('Exit full screen');
      expect(exitFullscreen).toHaveBeenCalledTimes(1);
    });

    it('notices the browser leaving full screen, such as on Escape', () => {
      fixture.componentRef.setInput('fullscreen', true);
      fixture.detectChanges();
      setFullscreenElement(fixture.nativeElement);

      setFullscreenElement(null);

      expect(fixture.componentInstance.isFullscreen()).toBe(false);
      expect(buttons()).toEqual(['Full screen']);
    });

    it('ignores another element going full screen', () => {
      fixture.componentRef.setInput('fullscreen', true);
      fixture.detectChanges();

      setFullscreenElement(document.body);

      expect(fixture.componentInstance.isFullscreen()).toBe(false);
    });
  });
});

describe('qrModules()', () => {
  it('leaves a four-module quiet zone on every side, so a phone can find the code on a busy slide', () => {
    const { size, data } = qrModules('https://gisday.tamu.edu');

    expect(data).toHaveLength(size);

    for (const i of [0, 1, 2, 3, size - 4, size - 3, size - 2, size - 1]) {
      expect(data[i].some(Boolean)).toBe(false);
      expect(data.some((row) => row[i])).toBe(false);
    }
  });

  it('starts the code itself with a finder pattern in the corner', () => {
    const { data } = qrModules('https://gisday.tamu.edu');

    // The top row of the top-left finder: seven dark modules, inside the quiet zone.
    expect(data[4].slice(4, 11)).toEqual([true, true, true, true, true, true, true]);
  });

  it('gives different text a different code', () => {
    expect(qrModules('a').data).not.toEqual(qrModules('b').data);
  });
});

describe('qrPath()', () => {
  it('draws one unit square per dark module and nothing for a light one', () => {
    expect(
      qrPath([
        [true, false],
        [false, true]
      ])
    ).toBe('M0 0h1v1h-1zM1 1h1v1h-1z');
  });
});
