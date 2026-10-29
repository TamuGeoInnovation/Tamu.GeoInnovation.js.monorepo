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
