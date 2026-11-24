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

/** An opened row's people, capped, beside a box with the default: the dashboard's own table. */
@Component({
  imports: [DashboardScrollComponent],
  template: `<tamu-gisc-dashboard-scroll class="plain"><table></table></tamu-gisc-dashboard-scroll>
    <tamu-gisc-dashboard-scroll class="capped" [capped]="true"><table></table></tamu-gisc-dashboard-scroll>`
})
class CappedHostComponent {}

/**
 * The declarations of the capped box's rule, from the component's own stylesheet: jsdom lays nothing out, and the
 * tests are given no component styles, so the rule the browser applies is read where it is written.
 */
function cappedRule(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readFileSync } = require('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { join } = require('path');
  const scss: string = readFileSync(join(__dirname, 'dashboard-scroll.component.scss'), 'utf8');
  const start = scss.indexOf('&.dashboard-scroll-capped {');

  return start < 0 ? '' : scss.slice(start, scss.indexOf('}', start));
}

/**
 * #3120: an opened feature type on the VGI dashboard listed 705 people, and the people's box, as tall as all of them,
 * kept its own sideways scrollbar about 38,000 px down the page. A capped box is no taller than the window, less room for
 * the opened row's heading above it and the dashboard table's rail below, so it scrolls inside itself and its scrollbar
 * is in view whenever the box is. Playwright measured the real page at 1280 x 900.
 */
describe('DashboardScrollComponent, capped (#3120)', () => {
  let fixture: ComponentFixture<CappedHostComponent>;

  const host = (name: string) =>
    (fixture.nativeElement as HTMLElement).querySelector(`tamu-gisc-dashboard-scroll.${name}`) as HTMLElement;
  const box = (name: string) => host(name).querySelector(':scope > .dashboard-scroll') as HTMLElement;
  const rail = (name: string) => host(name).querySelector(':scope > .dashboard-scroll-rail') as HTMLElement;
  const instance = (name: string) =>
    fixture.debugElement.queryAll(By.directive(DashboardScrollComponent)).find((d) => d.nativeElement === host(name))
      ?.componentInstance as DashboardScrollComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [CappedHostComponent] });
    fixture = TestBed.createComponent(CappedHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('caps the box at the window, less room around it, and scrolls it up and down inside itself', () => {
    expect(box('capped').classList).toContain('dashboard-scroll-capped');
    expect(cappedRule()).toMatch(/max-height: calc\(100vh - [^;]+\);/);
    expect(cappedRule()).toMatch(/overflow-y: auto;/);
  });

  it('keeps its own sideways scrollbar, never a rail, since its bottom is in view with the box', () => {
    Object.defineProperty(box('capped'), 'clientWidth', { configurable: true, value: 600 });
    Object.defineProperty(box('capped'), 'scrollWidth', { configurable: true, value: 1100 });
    instance('capped').measure();
    fixture.detectChanges();

    expect(instance('capped').overflow()).toBeNull();
    expect(box('capped').classList).not.toContain('dashboard-scroll-railed');
    expect(rail('capped').hidden).toBe(true);
  });

  it('gives a short list no height of its own: a few people make a box only as tall as they are', () => {
    expect(cappedRule()).not.toBe('');
    expect(cappedRule()).not.toMatch(/(^|[\s;{])(min-)?height:/);
  });

  it('leaves a box uncapped unless asked, as the dashboard table is, with its rail when it is wider than the box', () => {
    Object.defineProperty(box('plain'), 'clientWidth', { configurable: true, value: 600 });
    Object.defineProperty(box('plain'), 'scrollWidth', { configurable: true, value: 891 });
    instance('plain').measure();
    fixture.detectChanges();

    expect(box('plain').classList).not.toContain('dashboard-scroll-capped');
    expect(rail('plain').hidden).toBe(false);
  });
});
