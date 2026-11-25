import type { Mock } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BehaviorSubject, of, Subject } from 'rxjs';

import { SeasonService, TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { AlertModalComponent } from '@tamu-gisc/ui-kits/ngx/layout/modal/alert-modal';

import { TagsEditComponent } from '../tag/pages/tags-edit/tags-edit.component';

@Component({ template: 'The tags list' })
class TagsListStubComponent {}

@Component({ template: 'Somewhere else' })
class ElsewhereStubComponent {}

/**
 * #2942. On an admin details page, Escape goes back to the list the page was opened from, keeping its season, as
 * closing a dialog does. With changes not saved it asks first, in the page; an Escape something else on the page
 * used, or one meant for an open modal, is left to it.
 *
 * Tried on a real page, the tag's edit page, with its real form: every admin details page shares the one piece.
 */
describe('Escape on an admin details page', () => {
  let modal: { isOpen: BehaviorSubject<boolean>; open: Mock };
  let answer: Subject<boolean>;

  beforeEach(() => {
    answer = new Subject<boolean>();
    modal = { isOpen: new BehaviorSubject(false), open: vi.fn(() => answer) };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'admin/tags',
            children: [
              { path: 'edit/:guid', component: TagsEditComponent },
              { path: '', component: TagsListStubComponent }
            ]
          },
          { path: 'admin/elsewhere', component: ElsewhereStubComponent }
        ]),
        provideLocationMocks(),
        {
          provide: TagService,
          useValue: { getEntity: () => of({ guid: 't1', name: 'Workshop' }), getSessions: () => of([]) }
        },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 's-2026' }) } },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: ModalService, useValue: modal }
      ]
    });
  });

  /** Escape as a keyboard sends it: down, then up. `used` is a handler on the page claiming it. */
  async function pressEscape(harness: RouterTestingHarness, used = false) {
    const down = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });

    if (used) {
      down.preventDefault();
    }

    document.body.dispatchEvent(down);
    document.body.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', bubbles: true, cancelable: true }));
    await settle(harness);
  }

  /** The router takes up a Back (a popstate) on a timeout of its own. */
  async function settle(harness: RouterTestingHarness) {
    await new Promise((resolve) => setTimeout(resolve));
    await harness.fixture.whenStable();
    harness.detectChanges();
  }

  function url() {
    return TestBed.inject(Router).url;
  }

  async function openedFromList() {
    const harness = await RouterTestingHarness.create('/admin/tags?season=s-2025');
    // What the app's start does, and a test's does not: the router follows the browser's Back.
    TestBed.inject(Router).setUpLocationChangeListener();
    await harness.navigateByUrl('/admin/tags/edit/t1');

    return harness;
  }

  function typeName(harness: RouterTestingHarness, text: string) {
    const input: HTMLInputElement = harness.routeNativeElement.querySelector('tamu-gisc-textbox input');
    input.value = text;
    input.dispatchEvent(new Event('input'));
    harness.detectChanges();
  }

  it('goes back to the list it was opened from, with its season', async () => {
    const harness = await openedFromList();

    await pressEscape(harness);

    expect(url()).toBe('/admin/tags?season=s-2025');
  });

  it('goes to the list when the page was not opened from it', async () => {
    const harness = await RouterTestingHarness.create('/admin/elsewhere');
    await harness.navigateByUrl('/admin/tags/edit/t1');

    await pressEscape(harness);

    expect(url()).toBe('/admin/tags');
  });

  it('asks "Leave without saving?" in the page when the form has changes, and stays until told to leave', async () => {
    const harness = await openedFromList();
    typeName(harness, 'Workshops');

    await pressEscape(harness);

    expect(modal.open).toHaveBeenCalledWith(
      AlertModalComponent,
      expect.objectContaining({ data: expect.objectContaining({ title: 'Leave without saving?' }) })
    );
    expect(url()).toBe('/admin/tags/edit/t1');

    answer.next(true);
    answer.complete();
    await settle(harness);

    expect(url()).toBe('/admin/tags?season=s-2025');
  });

  it('stays, with the changes, when the answer is to keep editing', async () => {
    const harness = await openedFromList();
    typeName(harness, 'Workshops');

    await pressEscape(harness);
    answer.next(false);
    answer.complete();
    await settle(harness);

    expect(url()).toBe('/admin/tags/edit/t1');
    expect((harness.routeNativeElement.querySelector('tamu-gisc-textbox input') as HTMLInputElement).value).toBe(
      'Workshops'
    );
  });

  it('leaves an Escape that something on the page used to it', async () => {
    const harness = await openedFromList();

    await pressEscape(harness, true);

    expect(url()).toBe('/admin/tags/edit/t1');
  });

  it('leaves an Escape to an open modal', async () => {
    const harness = await openedFromList();
    modal.isOpen.next(true);

    await pressEscape(harness);

    expect(url()).toBe('/admin/tags/edit/t1');
    expect(modal.open).not.toHaveBeenCalled();
  });
});
