import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  input,
  signal,
  viewChild
} from '@angular/core';

import { register } from 'swiper/element/bundle';
import GLightbox from 'glightbox';

/**
 * A carousel of photos that opens any of them full screen.
 *
 * The carousel is Swiper's web component; the full-screen view is GLightbox (MIT), which replaced lightGallery
 * (GPLv3 or commercial) in AggieMap's POI and bonfire popups (#1218). In the full-screen view the arrow keys and
 * swipes move between photos and Escape closes it. Each slide is also a plain link to the photo, so it still opens
 * without the script.
 *
 * GLightbox's stylesheet is global, in each app that shows this (`@import 'glightbox/dist/css/glightbox.min'` in its
 * styles.scss): the full-screen view is built at the end of <body>, outside this component, and at 14 kB the
 * stylesheet would exceed a component's style budget.
 */
@Component({
  selector: 'tamu-gisc-photo-carousel',
  templateUrl: './photo-carousel.component.html',
  styleUrls: ['./photo-carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  // <swiper-container> is Swiper's web component, registered at run time.
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PhotoCarouselComponent implements AfterViewInit, OnDestroy {
  /** The photos' addresses, in order. */
  public readonly photos = input.required<Array<string>>();

  /**
   * The slides whose photo is fetched: the first, then each one a visitor reaches and the one either side of it.
   *
   * One slide shows at a time, yet every photo was fetched as soon as the carousel opened: a Nature Rx space's
   * photographs ran to 6.5 MB, all downloaded with the popup (#2716). `loading="lazy"` does not prevent that: the
   * next slides sit just past the edge of the screen, within the distance at which a browser loads a lazy image
   * anyway, and in a measured popup all four loaded. So a slide has no address until it is reached. Its neighbours
   * are fetched with it, so a visitor moving on, either way round the loop, finds the next photo already there.
   */
  public readonly reached = signal<ReadonlySet<number>>(new Set([0]));

  private readonly _swiper = viewChild.required<ElementRef>('swiper');

  private _lightbox: ReturnType<typeof GLightbox> | undefined;

  /** The slide on show, by its place in `photos`. */
  private _showing = 0;

  public ngAfterViewInit(): void {
    register();

    const swiper = this._swiper().nativeElement;

    Object.assign(swiper, {
      slidesPerView: 1,
      speed: 500,
      loop: true,
      navigation: true,
      preventClicks: true
    });

    swiper.initialize();

    // Swiper's web component dispatches its events with a `swiper` prefix.
    swiper.addEventListener('swiperslidechange', () => this._reach(swiper.swiper?.realIndex ?? 0));

    const photos = this.photos();

    this._lightbox = GLightbox({
      // GLightbox's own types declare `elements` as an empty tuple; it takes one object per slide.
      elements: photos.map((href, index) => ({
        href,
        type: 'image',
        alt: `Photo ${index + 1} of ${photos.length}`
      })) as unknown as [],
      loop: true,
      touchNavigation: true,
      keyboardNavigation: true
    });
  }

  /** Opens the photo at `index` full screen, instead of following the slide's link. */
  public open(event: Event, index: number): void {
    if (!this._lightbox) {
      return;
    }

    event.preventDefault();
    this._lightbox.openAt(index);
  }

  /**
   * Marks the slide at `index`, and the one either side of it, as reached, once the carousel has moved to it.
   *
   * Swiper reports a slide change several times as it lays the slides out, on the first slide still, so a change
   * that leaves it on the slide it was showing is not a visitor moving, and fetches nothing.
   */
  private _reach(index: number): void {
    if (index === this._showing) {
      return;
    }

    this._showing = index;

    const count = this.photos().length;
    const next = new Set(this.reached());

    [index - 1, index, index + 1].forEach((i) => next.add((i + count) % count));
    this.reached.set(next);
  }

  public ngOnDestroy(): void {
    this._lightbox?.destroy();
  }
}
