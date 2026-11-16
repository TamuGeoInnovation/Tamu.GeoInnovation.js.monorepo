import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';

/**
 * A box that scrolls its content sideways when it is wider than the box, with a second scrollbar under it, pinned to the
 * bottom of the window while any of the box is in view (#3029). A dashboard's table can be 60 rows long, and the box's
 * own scrollbar is at its bottom, out of sight. Moved here from the dashboard table, so its people's tables, which grew
 * count columns on the VGI dashboard (#2894), scroll the same way.
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
  private readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
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

    this.overflow.set(scrollWidth > clientWidth ? scrollWidth : null);
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
