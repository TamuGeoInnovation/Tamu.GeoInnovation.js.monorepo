import { TestBed } from '@angular/core/testing';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

import { SpeakerClassBannerComponent } from './speaker-class-banner.component';

describe('SpeakerClassBannerComponent', () => {
  function banner(speaker: unknown): HTMLElement | null {
    const fixture = TestBed.createComponent(SpeakerClassBannerComponent);
    fixture.componentRef.setInput('speaker', speaker as Partial<Speaker>);
    fixture.detectChanges();

    return (fixture.nativeElement as HTMLElement).querySelector('.class-banner');
  }

  const text = (speaker: unknown) => banner(speaker)?.textContent?.trim();

  it('shows the university and the last two digits of a four-digit class year', () => {
    expect(text({ university: { acronym: 'TAMU', hexTriplet: '500000' }, graduationYear: '2024' })).toBe("TAMU '24");
  });

  it('keeps a two-digit class year as it was entered', () => {
    expect(text({ university: { acronym: 'LSU', hexTriplet: '461d7c' }, graduationYear: '22' })).toBe("LSU '22");
  });

  it('shows the university alone when no class year was recorded', () => {
    expect(text({ university: { acronym: 'UCONN', hexTriplet: '000e2f' }, graduationYear: null })).toBe('UCONN');
  });

  it("is drawn in the university's colour", () => {
    const element = banner({ university: { acronym: 'GSU', hexTriplet: '0039a6' }, graduationYear: '1991' });

    expect(element?.style.background).toBe('rgb(0, 57, 166)');
  });

  it('shows nothing for a presenter with no university', () => {
    expect(banner({ graduationYear: '2024' })).toBeNull();
    expect(banner({ university: null, graduationYear: '2024' })).toBeNull();
  });

  it('shows nothing when the class year is an empty string', () => {
    expect(banner({ university: { acronym: 'TAMU', hexTriplet: '500000' }, graduationYear: '' })).toBeNull();
  });
});
