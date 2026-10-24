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
    glightbox: vi.fn<(options: { elements: Array<{ href: string; type: string }> }) => { openAt: typeof openAt; destroy: typeof destroy }>(
      () => ({ openAt, destroy })
    )
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
});
