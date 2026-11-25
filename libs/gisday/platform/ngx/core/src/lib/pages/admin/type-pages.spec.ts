import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter, Route, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BehaviorSubject, map, of, Subject, timer } from 'rxjs';

import { RsvpTypeService, SeasonService, SubmissionTypeService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { adminRoutes } from './admin.routes';

/** The admin route at `path`, as the site loads it. */
function adminRoute(path: string): Route {
  const route = adminRoutes[0].children?.find((r) => r.path === path);

  expect(route).toBeDefined();

  return route as Route;
}

/**
 * The RSVP type and submission type pages (#3328). They were the only admin pages on the old base classes, which had no
 * Escape and no "Leave without saving?" (#2942), so a fix to admin pages missed them. These hold what they show, and
 * that they now behave as every other admin page does. Made-up types only.
 */
describe.each([
  ['rsvp-types', RsvpTypeService, 'Type'],
  ['submission-types', SubmissionTypeService, 'Submission Type']
])('the %s pages', (path, service, field) => {
  let modal: { isOpen: BehaviorSubject<boolean>; open: Mock };
  let answer: Subject<boolean>;

  beforeEach(() => {
    answer = new Subject<boolean>();
    modal = { isOpen: new BehaviorSubject(false), open: vi.fn(() => answer) };
    const types = [
      { guid: 't-1', type: 'Made-up type', updated: '2026-11-01T15:00:00.000Z' },
      { guid: 't-2', type: 'Another made-up type', updated: '2026-11-02T15:00:00.000Z' }
    ];

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ ...adminRoute(path), path: `admin/${path}` }]),
        provideLocationMocks(),
        {
          provide: service,
          useValue: {
            getEntities: () => of(types),
            // Answered later, as HTTP is: the old edit pages made their form after asking for the record.
            getEntity: () => timer(0).pipe(map(() => types[0])),
            createEntity: vi.fn(() => of({})),
            updateEntity: vi.fn(() => of({})),
            deleteEntity: vi.fn(() => of({}))
          }
        },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of({ guid: 's-2026', year: 2026 }) } },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: ModalService, useValue: modal }
      ]
    });
  });

  async function settle(harness: RouterTestingHarness) {
    await new Promise((resolve) => setTimeout(resolve));
    await harness.fixture.whenStable();
    harness.detectChanges();
  }

  async function open(url: string) {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl(url);
    await settle(harness);

    return harness;
  }

  async function pressEscape(harness: RouterTestingHarness) {
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    document.body.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', bubbles: true, cancelable: true }));
    await settle(harness);
  }

  const root = (harness: RouterTestingHarness) => harness.routeNativeElement as HTMLElement;

  // Pins: what the pages showed on the old base classes, kept by the move.
  it('lists the types by Type and Updated', async () => {
    const harness = await open(`/admin/${path}`);
    const headings = Array.from(root(harness).querySelectorAll('th')).map((th) => th.textContent.trim());

    expect(headings).toEqual(expect.arrayContaining(['Type', 'Updated']));
    expect(root(harness).textContent).toContain('Made-up type');
    expect(root(harness).textContent).toContain('Another made-up type');
  });

  it.each(['add', 'edit/t-1'])('asks for the type by its own label on its %s page', async (page) => {
    const harness = await open(`/admin/${path}/${page}`);

    expect(root(harness).querySelector('tamu-gisc-textbox label')?.textContent.trim()).toBe(field);
  });

  // #2942, which the old pages lacked: red on them.
  it('goes back to the list on Escape', async () => {
    const harness = await open(`/admin/${path}/edit/t-1`);

    await pressEscape(harness);

    expect(TestBed.inject(Router).url).toBe(`/admin/${path}`);
  });

  it('asks "Leave without saving?" on Escape with a change not saved', async () => {
    const harness = await open(`/admin/${path}/edit/t-1`);
    const input = root(harness).querySelector('tamu-gisc-textbox input') as HTMLInputElement;

    input.value = 'A changed made-up type';
    input.dispatchEvent(new Event('input'));
    await settle(harness);
    await pressEscape(harness);

    expect(modal.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: expect.objectContaining({ title: 'Leave without saving?' }) })
    );
    expect(TestBed.inject(Router).url).toBe(`/admin/${path}/edit/t-1`);
  });
});
