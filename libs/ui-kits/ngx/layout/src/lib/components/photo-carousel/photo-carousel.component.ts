import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  input,
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

  private readonly _swiper = viewChild.required<ElementRef>('swiper');

  private _lightbox: ReturnType<typeof GLightbox> | undefined;

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

  public ngOnDestroy(): void {
    this._lightbox?.destroy();
  }
}
