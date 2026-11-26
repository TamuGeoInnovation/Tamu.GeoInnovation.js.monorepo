import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Angulartics2 } from 'angulartics2';

import { PopupFooterComponent } from './popup-footer.component';

/** A popup using the footer as a popup does, with something of its own after it, as the bus stop's schedule link. */
@Component({
  template: `<tamu-gisc-popup-footer [shareUrl]="shareUrl" (startDirections)="planned = planned + 1">
    <a class="button schedule" href="https://example.com/schedule">View full schedule</a>
  </tamu-gisc-popup-footer>`,
  imports: [PopupFooterComponent]
})
class HostPopupComponent {
  public shareUrl: string | null = 'https://aggiemap.tamu.edu/?lot=100b';
  public planned = 0;
}

describe('PopupFooterComponent', () => {
  let fixture: ComponentFixture<HostPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostPopupComponent],
      // The copy field reports a copy to analytics.
      providers: [{ provide: Angulartics2, useValue: { eventTrack: { next: vi.fn() } } }]
    }).compileComponents();

    fixture = TestBed.createComponent(HostPopupComponent);
  });

  function render(shareUrl: string | null): HTMLElement {
    fixture.componentInstance.shareUrl = shareUrl;
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  function directionsButton(footer: HTMLElement): HTMLElement | undefined {
    return Array.from(footer.querySelectorAll<HTMLElement>('.button')).find(
      (element) => element.textContent?.trim() === 'Directions To Here'
    );
  }

  it('offers the link that reopens the feature, in the shared copy field', () => {
    const copy = render('https://aggiemap.tamu.edu/?lot=100b').querySelector('tamu-gisc-copy-field .copy-text');

    expect(copy?.textContent?.trim()).toBe('https://aggiemap.tamu.edu/?lot=100b');
  });

  it('offers no copy link when there is no link that reopens the feature (#1173)', () => {
    expect(render(null).querySelector('tamu-gisc-copy-field')).toBeNull();
    expect(render('').querySelector('tamu-gisc-copy-field')).toBeNull();
  });

  it('offers "Directions To Here" either way (#602)', () => {
    expect(directionsButton(render('https://aggiemap.tamu.edu/?lot=100b'))).toBeDefined();
    expect(directionsButton(render(null))).toBeDefined();
  });

  it('hands "Directions To Here" to the popup, by click and by keyboard, once each', () => {
    const button = directionsButton(render(null));

    button?.click();
    button?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(fixture.componentInstance.planned).toBe(2);
  });

  it('is a button to the keyboard and to a screen reader, as every popup button is', () => {
    const button = directionsButton(render(null));

    expect(button?.getAttribute('role')).toBe('button');
    expect(button?.getAttribute('tabindex')).toBe('0');
  });

  it('puts what the popup places inside it after "Directions To Here"', () => {
    const footer = render(null);
    const buttons = Array.from(footer.querySelectorAll<HTMLElement>('.button')).map((b) => b.textContent?.trim());

    expect(buttons).toEqual(['Directions To Here', 'View full schedule']);
  });
});
