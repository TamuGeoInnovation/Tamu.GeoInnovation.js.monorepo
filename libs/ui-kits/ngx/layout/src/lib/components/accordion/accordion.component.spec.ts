import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AccordionComponent } from './accordion.component';
import { AccordionHeaderComponent } from './accordion-header/accordion-header.component';
import { AccordionContentComponent } from './accordion-content/accordion-content.component';

@Component({
  imports: [AccordionComponent, AccordionHeaderComponent, AccordionContentComponent],
  template: `
    <tamu-gisc-accordion [(expanded)]="open">
      <tamu-gisc-accordion-header>Stops</tamu-gisc-accordion-header>
      <tamu-gisc-accordion-content>The list</tamu-gisc-accordion-content>
    </tamu-gisc-accordion>
  `
})
class HostComponent {
  public readonly open = signal(false);
}

/**
 * #3221. The accordion read its `expanded` binding once, on its first draw, so a parent could not open it afterwards
 * (AggieMap's bus stops list binds it to a toggle), and its header was a clickable box the keyboard could not reach.
 */
describe('AccordionComponent', () => {
  function draw() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const header = page.querySelector('tamu-gisc-accordion-header') as HTMLElement;
    const shown = () => page.querySelector('.content-container')?.classList.contains('expanded') ?? false;

    return { fixture, header, shown, open: fixture.componentInstance.open };
  }

  it("opens and closes when the parent's binding changes, after the first draw", () => {
    const { fixture, shown, open } = draw();

    expect(shown()).toBe(false);

    open.set(true);
    fixture.detectChanges();

    expect(shown()).toBe(true);

    open.set(false);
    fixture.detectChanges();

    expect(shown()).toBe(false);
  });

  it('tells the parent when the header opens or closes it', () => {
    const { fixture, header, shown, open } = draw();

    header.click();
    fixture.detectChanges();

    expect(open()).toBe(true);
    expect(shown()).toBe(true);

    header.click();
    fixture.detectChanges();

    expect(open()).toBe(false);
  });

  it('has a header that is a button, says whether it is open, and opens from the keyboard', () => {
    const { fixture, header, shown } = draw();

    expect(header.getAttribute('role')).toBe('button');
    expect(header.getAttribute('tabindex')).toBe('0');
    expect(header.getAttribute('aria-expanded')).toBe('false');

    header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(shown()).toBe(true);
    expect(header.getAttribute('aria-expanded')).toBe('true');

    header.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    fixture.detectChanges();

    expect(shown()).toBe(false);
  });
});
