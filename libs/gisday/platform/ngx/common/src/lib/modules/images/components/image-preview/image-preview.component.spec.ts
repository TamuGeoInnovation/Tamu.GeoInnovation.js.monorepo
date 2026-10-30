import { TestBed } from '@angular/core/testing';

import { ImagePreviewComponent } from './image-preview.component';

// #2569: a picture that is never a broken image.
describe('ImagePreviewComponent', () => {
  function render(inputs: Record<string, unknown>) {
    TestBed.configureTestingModule({ imports: [ImagePreviewComponent] });

    const fixture = TestBed.createComponent(ImagePreviewComponent);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const img = () => page.querySelector('img');
    const icon = () => page.querySelector('.material-icons')?.textContent.trim();

    return { fixture, page, img, icon };
  }

  it('shows the picture when there is one', () => {
    const { fixture, img, icon } = render({ src: 'assets/uploads/images/logo.png', alt: 'Logo' });

    expect(img()?.getAttribute('src')).toBe('assets/uploads/images/logo.png');
    expect(img()?.getAttribute('alt')).toBe('Logo');
    expect(icon()).toBeUndefined();
    expect(fixture.componentInstance.showing()).toBe(true);
  });

  it('shows the fallback icon, and no image, when there is no picture', () => {
    for (const src of [undefined, null, '']) {
      TestBed.resetTestingModule();
      const { fixture, img, icon } = render({ src, fallback: 'person' });

      expect(img()).toBeNull();
      expect(icon()).toBe('person');
      expect(fixture.componentInstance.showing()).toBe(false);
    }
  });

  it('shows the fallback icon in place of a picture that fails to load', () => {
    const { fixture, img, icon } = render({ src: 'assets/uploads/images/missing.png', fallback: 'business' });

    img().dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(img()).toBeNull();
    expect(icon()).toBe('business');
    expect(fixture.componentInstance.showing()).toBe(false);
  });

  it('gives a new picture a fresh chance after one fails', () => {
    const { fixture, img } = render({ src: 'assets/uploads/images/missing.png' });

    img().dispatchEvent(new Event('error'));
    fixture.detectChanges();
    fixture.componentRef.setInput('src', 'blob:chosen');
    fixture.detectChanges();

    expect(img()?.getAttribute('src')).toBe('blob:chosen');
  });

  it('shows nothing at all when there is no picture and no fallback', () => {
    const { page } = render({ src: null, fallback: null });

    expect(page.innerHTML.replace(/<!--.*?-->/g, '').trim()).toBe('');
  });

  it('describes the fallback to a screen reader only when given a label', () => {
    const labelled = render({ src: null, fallback: 'person', fallbackLabel: 'No photo yet' });
    expect(labelled.page.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('No photo yet');

    TestBed.resetTestingModule();
    const decorative = render({ src: null, fallback: 'person' });
    expect(decorative.page.querySelector('[role="img"]')).toBeNull();
  });
});
