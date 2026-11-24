import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionMenuComponent, ActionMenuItem } from './action-menu.component';

/**
 * #3092: one button that opens a short list of actions, so a page's email actions stop stacking side by side. It follows
 * the menu button pattern: the button says it has a menu and whether it is open, the list is a menu of items, the arrow
 * keys move between them, Enter or a click chooses one, and Escape or a click elsewhere closes it, with the focus back on
 * the button.
 */
@Component({
  imports: [ActionMenuComponent],
  template: `
    <p class="elsewhere">Elsewhere</p>
    <tamu-gisc-action-menu
      label="Email these speakers"
      icon="forward_to_inbox"
      [items]="items"
      (chosen)="chosen.set($event)"
    ></tamu-gisc-action-menu>
  `
})
class HostComponent {
  public readonly items: Array<ActionMenuItem> = [
    { id: 'profile', label: 'Profile email' },
    { id: 'session-details', label: 'Session details' },
    { id: 'reminder', label: 'Final reminder' }
  ];

  public readonly chosen = signal<string | null>(null);
}

describe('ActionMenuComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let page: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.autoDetectChanges();
    document.body.appendChild(fixture.nativeElement);
    page = fixture.nativeElement;
  });

  afterEach(() => {
    fixture.nativeElement.remove();
  });

  const button = () => page.querySelector<HTMLButtonElement>('tamu-gisc-action-menu button[aria-haspopup="menu"]');
  const menu = () => page.querySelector<HTMLElement>('[role="menu"]');
  const items = () => Array.from(page.querySelectorAll<HTMLElement>('[role="menuitem"]'));
  const key = (target: HTMLElement, name: string) => {
    const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  it('is one button that says it has a menu, closed until pressed', () => {
    expect(button()).not.toBeNull();
    expect(button().type).toBe('button');
    expect(button().textContent).toContain('Email these speakers');
    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(menu()).toBeNull();
  });

  it('opens on a click, as a labelled menu of its items, and closes on a second click', () => {
    button().click();
    fixture.detectChanges();

    expect(button().getAttribute('aria-expanded')).toBe('true');
    expect(menu()).not.toBeNull();
    expect(button().getAttribute('aria-controls')).toBe(menu().id);
    expect(menu().getAttribute('aria-labelledby')).toBe(button().id);
    expect(items().map((i) => i.textContent.trim())).toEqual(['Profile email', 'Session details', 'Final reminder']);
    // Each item is reached by the arrow keys, not by Tab.
    expect(items().every((i) => i.getAttribute('tabindex') === '-1')).toBe(true);

    button().click();
    fixture.detectChanges();

    expect(menu()).toBeNull();
    expect(button().getAttribute('aria-expanded')).toBe('false');
  });

  it('emits the item chosen by a click, closes, and puts the focus back on the button', () => {
    button().click();
    fixture.detectChanges();
    items()[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.chosen()).toBe('session-details');
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(button());
  });

  it('closes on Escape, claiming it, with the focus back on the button and nothing chosen', () => {
    button().click();
    fixture.detectChanges();

    const event = key(items()[0], 'Escape');

    expect(event.defaultPrevented).toBe(true);
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(button());
    expect(fixture.componentInstance.chosen()).toBeNull();
  });

  it('leaves Escape alone while closed, so the page can give it its own meaning', () => {
    expect(key(button(), 'Escape').defaultPrevented).toBe(false);
  });

  it('closes on a click outside it, choosing nothing', () => {
    button().click();
    fixture.detectChanges();

    page.querySelector<HTMLElement>('.elsewhere').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    fixture.detectChanges();

    expect(menu()).toBeNull();
    expect(fixture.componentInstance.chosen()).toBeNull();
  });

  it('opens from the keyboard on the first item, moves with the arrows, Home and End, and chooses with Enter', () => {
    button().focus();
    key(button(), 'ArrowDown');

    expect(menu()).not.toBeNull();
    expect(document.activeElement).toBe(items()[0]);

    key(items()[0], 'ArrowDown');
    expect(document.activeElement).toBe(items()[1]);

    key(items()[1], 'End');
    expect(document.activeElement).toBe(items()[2]);

    // Past the last, back to the first.
    key(items()[2], 'ArrowDown');
    expect(document.activeElement).toBe(items()[0]);

    key(items()[0], 'ArrowUp');
    expect(document.activeElement).toBe(items()[2]);

    key(items()[2], 'Home');
    expect(document.activeElement).toBe(items()[0]);

    const enter = key(items()[0], 'Enter');

    expect(enter.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.chosen()).toBe('profile');
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(button());
  });

  it('opens on the last item with ArrowUp, and on the first with Enter or Space', () => {
    button().focus();
    key(button(), 'ArrowUp');
    expect(document.activeElement).toBe(items()[2]);
    key(items()[2], 'Escape');

    for (const name of ['Enter', ' ']) {
      const event = key(button(), name);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(items()[0]);
      key(items()[0], 'Escape');
    }
  });

  it('closes when the focus leaves it by Tab, choosing nothing', () => {
    button().click();
    fixture.detectChanges();

    key(items()[0], 'Tab');

    expect(menu()).toBeNull();
    expect(fixture.componentInstance.chosen()).toBeNull();
  });
});
