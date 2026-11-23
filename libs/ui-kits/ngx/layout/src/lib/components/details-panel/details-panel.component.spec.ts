import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { DetailsPanelComponent } from './details-panel.component';

@Component({
  imports: [DetailsPanelComponent],
  template: `
    <button type="button" id="opener" (click)="open.set(true)">Open</button>
    @if (open()) {
    <tamu-gisc-details-panel label="An entry" (closeRequested)="requests = requests + 1">
      <input id="inside" (keydown.escape)="$event.preventDefault()" />
    </tamu-gisc-details-panel>
    }
  `
})
class HostComponent {
  public readonly open = signal(false);
  public requests = 0;
}

/**
 * #3230. One record opened over the page: the page decides whether it closes, so Escape and a click beside it only ask, and
 * a control inside that uses Escape itself keeps it.
 */
describe('DetailsPanelComponent', () => {
  function draw() {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const opener = page.querySelector<HTMLButtonElement>('#opener');

    opener.focus();
    opener.click();
    fixture.detectChanges();

    return { fixture, page, host: fixture.componentInstance, opener };
  }

  const escape = (target: EventTarget) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));

  it('opens as a dialog named by its label, with focus in it and the page behind it held still', () => {
    const { page } = draw();
    const dialog = page.querySelector<HTMLElement>('[role="dialog"]');

    expect(dialog.getAttribute('aria-label')).toBe('An entry');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(dialog);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('asks to close on Escape and on a click beside it, and leaves the closing to the page', () => {
    const { page, host } = draw();

    escape(document);
    page.querySelector<HTMLElement>('.details-panel-backdrop').click();

    expect(host.requests).toBe(2);
    expect(page.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it('does not ask when a control inside used the Escape itself', () => {
    const { page, host } = draw();

    escape(page.querySelector('#inside'));

    expect(host.requests).toBe(0);
  });

  it('gives focus back, and lets the page scroll again, when it closes', () => {
    const { fixture, host, opener } = draw();

    host.open.set(false);
    fixture.detectChanges();

    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe('');
    fixture.nativeElement.remove();
  });
});
