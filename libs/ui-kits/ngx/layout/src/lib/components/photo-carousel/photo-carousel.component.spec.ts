import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

// vi.mock runs before the module's own statements, so the mocks it returns are made with vi.hoisted.
const { openAt, destroy, glightbox } = vi.hoisted(() => {
  const openAt = vi.fn();
  const destroy = vi.fn();

  // Typed with the options GLightbox is called with, so the tests can read them back from its calls.
  return {
    openAt,
    destroy,
    glightbox: vi.fn<
      (options: { elements: Array<{ href: string; type: string }> }) => { openAt: typeof openAt; destroy: typeof destroy }
    >(() => ({ openAt, destroy }))
  };
});

vi.mock('glightbox', () => ({ default: glightbox }));
vi.mock('swiper/element/bundle', () => ({ register: vi.fn() }));

import { PhotoCarouselComponent } from './photo-carousel.component';

// Swiper's web component is not registered here (register() is mocked), so a stand-in gives the element the one
// method the component calls on it.
if (!customElements.get('swiper-container')) {
  customElements.define(
    'swiper-container',
    class extends HTMLElement {
      public initialize(): void {
        return;
      }
    }
  );
}

describe('PhotoCarouselComponent', () => {
  const photos = ['https://example.com/a.jpg', 'https://example.com/b.jpg', 'https://example.com/c.jpg'];

  function create() {
    const fixture = TestBed.createComponent(PhotoCarouselComponent);
    fixture.componentRef.setInput('photos', photos);
    fixture.detectChanges();

    return fixture;
  }

  beforeEach(() => {
    openAt.mockClear();
    destroy.mockClear();
    glightbox.mockClear();
  });

  it('gives the full-screen view one image per photo, in order', () => {
    create();

    expect(glightbox).toHaveBeenCalledTimes(1);
    const options = glightbox.mock.calls[0][0];
    expect(options.elements.map((element) => element.href)).toEqual(photos);
    expect(options.elements.every((element) => element.type === 'image')).toBe(true);
  });

  it('opens the clicked photo full screen instead of following its link', () => {
    const fixture = create();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('a');

    const click = new MouseEvent('click', { cancelable: true });
    links[1].dispatchEvent(click);

    expect(openAt).toHaveBeenCalledWith(1);
    expect(click.defaultPrevented).toBe(true);
  });

  it('removes the full-screen view with the component', () => {
    const fixture = create();

    fixture.destroy();

    expect(destroy).toHaveBeenCalledTimes(1);
  });

  /**
   * Only the photo on show is fetched when the carousel opens; each further one when its slide is reached, with the
   * one either side of it (#2716). Every photo used to be fetched at once: a Nature Rx space's ran to 6.5 MB.
   */
  describe('fetching photos', () => {
    /** The photos the slides would fetch now: an `<img>` with no address fetches nothing. */
    function fetched(fixture: ReturnType<typeof create>): Array<string | null> {
      return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('img')).map((img) =>
        img.getAttribute('src')
      );
    }

    /** Moves the stand-in carousel to `realIndex` and reports the change as Swiper's web component does. */
    function slideTo(fixture: ReturnType<typeof create>, realIndex: number): void {
      const swiper = (fixture.nativeElement as HTMLElement).querySelector('swiper-container') as HTMLElement & {
        swiper?: { realIndex: number };
      };

      swiper.swiper = { realIndex };
      swiper.dispatchEvent(new Event('swiperslidechange'));
      fixture.detectChanges();
    }

    it('fetches only the first photo when it opens', () => {
      expect(fetched(create())).toEqual([photos[0], null, null]);
    });

    it('fetches nothing more for the changes Swiper reports while laying out, still on the first slide', () => {
      const fixture = create();

      slideTo(fixture, 0);
      slideTo(fixture, 0);

      expect(fetched(fixture)).toEqual([photos[0], null, null]);
    });

    it('fetches a photo, and the one either side of it, once its slide is reached', () => {
      const fixture = create();

      slideTo(fixture, 1);

      expect(fetched(fixture)).toEqual(photos);
    });

    it('goes round the loop: going back from the first fetches the last', () => {
      const many = ['a', 'b', 'c', 'd', 'e'].map((name) => `https://example.com/${name}.jpg`);
      const fixture = TestBed.createComponent(PhotoCarouselComponent);
      fixture.componentRef.setInput('photos', many);
      fixture.detectChanges();

      slideTo(fixture, 4);

      expect(fetched(fixture)).toEqual([many[0], null, null, many[3], many[4]]);
    });

    it('keeps every slide a link to its photo, fetched or not', () => {
      const links = (create().nativeElement as HTMLElement).querySelectorAll('a');

      expect(Array.from(links).map((link) => link.getAttribute('href'))).toEqual(photos);
    });
  });
});
