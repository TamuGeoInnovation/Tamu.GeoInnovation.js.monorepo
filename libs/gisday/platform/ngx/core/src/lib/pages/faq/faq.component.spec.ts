import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { gisdaySite } from '@tamu-gisc/gisday/common';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';

import { FaqComponent } from './faq.component';

/**
 * #2548. A question on the FAQ page could not be linked to on its own: three questions shared one id, a linked
 * question stayed closed, and nothing on the page gave a question's address.
 */
describe('FaqComponent', () => {
  let fragment: BehaviorSubject<string | null>;

  async function render(initial: string | null = null) {
    fragment = new BehaviorSubject<string | null>(initial);

    TestBed.configureTestingModule({
      imports: [FaqComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { fragment } },
        { provide: GISDAY_SITE, useValue: gisdaySite('txgisday') }
      ]
    });

    const fixture = TestBed.createComponent(FaqComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    return { fixture, page: fixture.nativeElement as HTMLElement };
  }

  const questions = (page: HTMLElement) => Array.from(page.querySelectorAll<HTMLElement>('.faq-item'));

  beforeAll(() => {
    // jsdom has no layout, so no scrollIntoView.
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('gives every question its own id', async () => {
    const { page } = await render();
    const ids = questions(page).map((item) => item.id);

    expect(ids.length).toBeGreaterThan(5);
    expect(ids.every((id) => /^[a-z0-9-]+$/.test(id))).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('opens and shows the question named in the address', async () => {
    const { page } = await render('zoom-link');
    const zoom = page.querySelector<HTMLElement>('#zoom-link');

    expect(zoom?.textContent).toContain('Zoom link');
    expect(zoom?.classList).toContain('expanded');
    expect(zoom?.scrollIntoView).toHaveBeenCalled();
    expect(questions(page).filter((item) => item.classList.contains('expanded'))).toHaveLength(1);
  });

  it('opens a question when a link on the page points at it', async () => {
    const { page } = await render();

    fragment.next('website-checkin');

    expect(page.querySelector('#website-checkin')?.classList).toContain('expanded');
  });

  it('ignores an address that names no question', async () => {
    const { page } = await render('no-such-question');

    expect(questions(page).some((item) => item.classList.contains('expanded'))).toBe(false);
  });

  it('gives each question a button that copies its address', async () => {
    const { page } = await render();
    const askable = questions(page).filter((item) => item.querySelector('p[role="button"]'));

    expect(askable.length).toBeGreaterThan(5);

    for (const item of askable) {
      const button = item.querySelector<HTMLButtonElement>('button.faq-link');

      expect(button?.getAttribute('aria-label')).toBe('Copy a link to this question');
    }
  });

  it('builds the address from the page and the question', async () => {
    const { fixture } = await render();

    expect(fixture.componentInstance.linkTo('event-cost')).toBe(`${location.origin}${location.pathname}#event-cost`);
  });

  it('does not open or close the question when its link is copied', async () => {
    const { fixture, page } = await render();
    const item = page.querySelector<HTMLElement>('#event-cost');

    item.querySelector<HTMLButtonElement>('button.faq-link').click();
    fixture.detectChanges();

    expect(item.classList).not.toContain('expanded');
    expect(item.querySelector('button.faq-link').textContent.trim()).toBe('check');
  });

  it('still opens and closes a question when its text is clicked', async () => {
    const { page } = await render();
    const item = page.querySelector<HTMLElement>('#event-cost');
    const question = item.querySelector<HTMLElement>('p[role="button"] span');

    question.click();
    expect(item.classList).toContain('expanded');

    question.click();
    expect(item.classList).not.toContain('expanded');
  });
});
