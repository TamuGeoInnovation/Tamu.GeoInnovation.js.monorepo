import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DashboardScrollComponent } from './dashboard-scroll.component';

/** A dashboard's table with an opened row's people inside it: one scrolling box inside another, as the VGI dashboard has. */
@Component({
  imports: [DashboardScrollComponent],
  template: `<tamu-gisc-dashboard-scroll class="outer"
    ><div>
      <tamu-gisc-dashboard-scroll class="inner"><table></table></tamu-gisc-dashboard-scroll></div
  ></tamu-gisc-dashboard-scroll>`
})
class NestedHostComponent {}

/**
 * #2894, from the lab's retake at 1280 px: the people's box sat inside the dashboard table's own. Its rail stuck to the
 * table's box, not the window, so it was never in view, and a box with a rail hides its own scrollbar: the people table
 * could be scrolled sideways, with nothing showing it could.
 */
describe('DashboardScrollComponent, one inside another', () => {
  let fixture: ComponentFixture<NestedHostComponent>;

  const scrolls = () => fixture.debugElement.queryAll(By.directive(DashboardScrollComponent));
  const box = (host: Element) => host.querySelector(':scope > .dashboard-scroll') as HTMLElement;
  const rail = (host: Element) => host.querySelector(':scope > .dashboard-scroll-rail') as HTMLElement;

  /** Gives a box the layout jsdom does not have: its widths. */
  function layOut(element: HTMLElement, clientWidth: number, scrollWidth: number) {
    Object.defineProperty(element, 'clientWidth', { configurable: true, value: clientWidth });
    Object.defineProperty(element, 'scrollWidth', { configurable: true, value: scrollWidth });
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [NestedHostComponent] });
    fixture = TestBed.createComponent(NestedHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('gives the inner box no rail, so its own scrollbar shows when it is wider than its box', () => {
    const [outer, inner] = scrolls();

    layOut(box(inner.nativeElement), 600, 1100);
    (inner.componentInstance as DashboardScrollComponent).measure();
    fixture.detectChanges();

    expect((inner.componentInstance as DashboardScrollComponent).nested()).toBe(true);
    expect(rail(inner.nativeElement).hidden).toBe(true);
    // Its own scrollbar is not hidden for a rail: the way to scroll it is in view, under the table.
    expect(box(inner.nativeElement).classList).not.toContain('dashboard-scroll-railed');
    expect((outer.componentInstance as DashboardScrollComponent).nested()).toBe(false);
  });

  it('keeps the rail for the outer box, as the dashboard table has had since #3029', () => {
    const [outer] = scrolls();

    layOut(box(outer.nativeElement), 600, 891);
    (outer.componentInstance as DashboardScrollComponent).measure();
    fixture.detectChanges();

    expect(rail(outer.nativeElement).hidden).toBe(false);
    expect(box(outer.nativeElement).classList).toContain('dashboard-scroll-railed');
  });
});
