import { Component, DestroyRef, ElementRef, afterNextRender, inject, input, signal, viewChild } from '@angular/core';

/**
 * A box that scrolls its content sideways when it is wider than the box, with a second scrollbar under it, pinned to the
 * bottom of the window while any of the box is in view (#3029). A dashboard's table can be 60 rows long, and the box's
 * own scrollbar is at its bottom, out of sight. Moved here from the dashboard table, so its people's tables, which grew
 * count columns on the VGI dashboard (#2894), scroll the same way.
 *
 * A box inside another (an opened row's people inside the dashboard's table) has no rail, and shows its own scrollbar:
 * a sticky rail sticks to the nearest box that scrolls, here the outer one, so it was never in view, and a box with a rail
 * hides its own scrollbar, which left nothing showing the people could be scrolled (#2894, the lab's retake). Making the
 * rail stick to the window instead is not possible from inside a scrolling box, so the inner box keeps the plain rule.
 *
 * A `capped` box is never taller than the window, less room around it, and scrolls up and down inside itself, so its own
 * sideways scrollbar is in view whenever the box is (#3120). An opened row's people are capped: 705 people under one VGI
 * feature type put their box's scrollbar about 38,000 px down the page.
 */
@Component({
  selector: 'tamu-gisc-dashboard-scroll',
  templateUrl: './dashboard-scroll.component.html',
  styleUrls: ['./dashboard-scroll.component.scss']
})
export class DashboardScrollComponent {
  /**
   * How wide the content is, in pixels, while it is wider than its box, else null. The rail under the box is then drawn
   * that wide and scrolls with it, so the hidden columns can be found and reached without scrolling to the bottom.
   */
  public readonly overflow = signal<number | null>(null);
  /**
   * Whether the box is capped at the window's height. Its bottom, and so its own scrollbar, is then in view with the
   * box, and it has no rail. A box that fits is only as tall as its content.
   */
  public readonly capped = input(false);
  private readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly rail = viewChild.required<ElementRef<HTMLElement>>('rail');

  constructor() {
    const destroyRef = inject(DestroyRef);

    // The box changes width with the window, and its content with its columns and an opened row.
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') {
        return;
      }

      const box = this.box().nativeElement;
      const observer = new ResizeObserver(() => this.measure());

      observer.observe(box);
      Array.from(box.children).forEach((child) => observer.observe(child));
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  public measure() {
    const { scrollWidth, clientWidth } = this.box().nativeElement;

    // Nested or capped, the box keeps its own scrollbar, never a rail.
    this.overflow.set(scrollWidth > clientWidth && !this.nested() && !this.capped() ? scrollWidth : null);
  }

  /**
   * Whether the box is inside another dashboard scroll box, read from the page: an opened row is drawn from the page's
   * own template, so the outer box is not its parent to Angular's injector.
   */
  public nested(): boolean {
    return !!this.host.nativeElement.parentElement?.closest('tamu-gisc-dashboard-scroll');
  }

  /** Keeps the rail where the box is scrolled to, and the box where the rail is. */
  public followBox() {
    this.align(this.box().nativeElement, this.rail().nativeElement);
  }

  public followRail() {
    this.align(this.rail().nativeElement, this.box().nativeElement);
  }

  private align(from: HTMLElement, to: HTMLElement) {
    if (to.scrollLeft !== from.scrollLeft) {
      to.scrollLeft = from.scrollLeft;
    }
  }
}
