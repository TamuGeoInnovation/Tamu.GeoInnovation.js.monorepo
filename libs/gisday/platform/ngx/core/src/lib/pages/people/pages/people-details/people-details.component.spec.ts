import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import type { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { MATCHES_SHOWN, otherMatches, PeopleDetailsComponent } from './people-details.component';

const presenter = (guid: string, firstName: string, lastName: string, organization?: string) =>
  ({ guid, firstName, lastName, organization: organization ? { name: organization } : undefined }) as Partial<Speaker>;

const people = [
  presenter('p-1', 'José', 'Ortiz', 'Esri'),
  presenter('p-2', 'Ana', 'Lee', 'Texas A&M University'),
  presenter('p-3', 'Pat', 'Kim', 'Texas Water Development Board')
];

describe('otherMatches()', () => {
  it('finds the other presenters as the Presenters page does, ignoring accents, and leaves out the one shown', () => {
    expect(otherMatches(people, 'jose', 'p-2').shown.map((p) => p.guid)).toEqual(['p-1']);
    expect(otherMatches(people, 'texas', 'p-2').shown.map((p) => p.guid)).toEqual(['p-3']);
  });

  it('lists the first ten, and says how many match in all', () => {
    const many = Array.from({ length: 14 }, (_, i) => presenter(`m-${i}`, 'Sam', `Smith ${i}`));
    const matches = otherMatches(many, 'smith', 'none');

    expect(matches.shown).toHaveLength(MATCHES_SHOWN);
    expect(matches.total).toBe(14);
  });

  it('lists nothing with no search', () => {
    expect(otherMatches(people, '  ', 'p-1')).toBeNull();
  });
});

describe('PeopleDetailsComponent search (#2919)', () => {
  async function open(list = people) {
    TestBed.configureTestingModule({
      imports: [PeopleDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: EnvironmentService, useValue: { value: () => '' } },
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'p-2' }), snapshot: { params: { guid: 'p-2' }, queryParamMap: { get: () => null } } } },
        { provide: SpeakerService, useValue: { getPresenter: () => of(people[1]), getParticipatingPresenters: () => of(list) } },
        { provide: SeasonService, useValue: { seasonForRoute: () => of({ season: { guid: 's-1' }, isPast: false }) } }
      ]
    });

    const fixture = TestBed.createComponent(PeopleDetailsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }

  // Typing into the box: it takes focus, which opens the panel, and the search changes.
  async function type(fixture: Awaited<ReturnType<typeof open>>, text: string) {
    (fixture.nativeElement as HTMLElement).querySelector('.presenter-search-box').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    fixture.componentInstance.search.setValue(text);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('shows the search box, and nothing under it until something is typed', async () => {
    const root = (await open()).nativeElement as HTMLElement;

    expect(root.querySelector('.presenter-search tamu-gisc-textbox')).not.toBeNull();
    expect(root.querySelector('.search-results-container')).toBeNull();
  });

  it("lists the matching presenters under it, each opening that presenter's page", async () => {
    const root = await type(await open(), 'texas');
    const links = Array.from(root.querySelectorAll('.search-results-container .result-item a'));

    expect(links.map((a) => a.textContent.replace(/\s+/g, ' ').trim())).toEqual(['Pat Kim | Texas Water Development Board']);
    expect(links[0].getAttribute('href')).toBe('/presenters/details/p-3');
    expect(root.querySelector('.search-results-container .category-name').textContent.trim()).toBe('1 other presenter');
  });

  it('links to the Presenters page, already searched, when more match than it lists', async () => {
    const many = Array.from({ length: 12 }, (_, i) => presenter(`m-${i}`, 'Sam', `Smith ${i}`));
    const root = await type(await open(many), 'smith');
    const all = Array.from(root.querySelectorAll('.presenter-search a')).find((a) => a.textContent.includes('See all'));
    // No number: the list counts the presenter this page is for too, so it would say one more.

    // The ten, and the See all link, each in the panel's own item.
    expect(root.querySelectorAll('.search-results-container .result-item')).toHaveLength(MATCHES_SHOWN + 1);
    expect(all.textContent.trim()).toBe('See all matches on the Presenters page');
    expect(all.getAttribute('href')).toBe('/presenters?search=smith');
  });

  it('says when no other presenter matches', async () => {
    const root = await type(await open(), 'nobody');

    expect(root.querySelector('.presenter-search').textContent).toContain('No other presenters match "nobody"');
  });

  it('opens over the page, in the shared search results panel, and leaves the presenter where it was (#2923)', async () => {
    const root = await type(await open(), 'texas');

    expect(root.querySelector('.presenter-search-box .search-results-container')).not.toBeNull();
    // The panel is inside the box's own container, so the presenter below does not move.
    expect(root.querySelector('.presenter-details-item .search-results-container')).toBeNull();
  });

  it('closes on Escape, keeping what was typed, and opens again on typing', async () => {
    const fixture = await open();
    const root = await type(fixture, 'texas');
    const box = root.querySelector('.presenter-search-box');

    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(root.querySelector('.search-results-container')).toBeNull();
    expect(fixture.componentInstance.search.value).toBe('texas');

    box.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(root.querySelector('.search-results-container')).not.toBeNull();
  });

  it('closes when focus leaves the box for the rest of the page, but not for a match in the panel', async () => {
    const fixture = await open();
    const root = await type(fixture, 'texas');
    const box = root.querySelector('.presenter-search-box');
    const match = root.querySelector('.search-results-container .result-item a');

    box.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: match }));
    fixture.detectChanges();
    expect(root.querySelector('.search-results-container')).not.toBeNull();

    box.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
    fixture.detectChanges();
    expect(root.querySelector('.search-results-container')).toBeNull();
  });

  it('closes and clears when a presenter is chosen', async () => {
    const fixture = await open();
    const root = await type(fixture, 'texas');

    (root.querySelector('.search-results-container .result-item a') as HTMLElement).click();
    fixture.detectChanges();

    expect(root.querySelector('.search-results-container')).toBeNull();
    expect(fixture.componentInstance.search.value).toBe('');
  });
});
