import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';

import { SeasonService, TagService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SubmissionFilesComponent } from '@tamu-gisc/gisday/platform/ngx/common';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { AlertModalComponent } from '@tamu-gisc/ui-kits/ngx/layout/modal/alert-modal';

import { TagsAddComponent } from '../tag/pages/tags-add/tags-add.component';
import { TagsEditComponent } from '../tag/pages/tags-edit/tags-edit.component';
import { ResearchCompetitionReviewComponent } from '../research-competition/pages/research-competition-review/research-competition-review.component';

@Component({ template: 'A list' })
class ListStubComponent {}

@Component({ template: 'Somewhere else' })
class ElsewhereStubComponent {}

@Component({ selector: 'tamu-gisc-submission-files', template: '' })
class FilesStubComponent {
  public readonly submissionGuid = input<string>();
}

/**
 * #2965. Save, Create and Delete on an admin details page go back to the list the page was opened from, as Escape
 * does (#2942): the list keeps its season, in its address, and its search, in its history entry. They used to go to
 * the bare list, so an admin working through one season's list was put back on the current season, unsearched, after
 * every save.
 *
 * Tried on real pages with their real forms: the tag's add and edit pages, whose form is the shared one in
 * gisday/platform/ngx/common as every other entity's is, and the submission review, which saves in the page itself.
 */
describe('Save, Create and Delete on an admin details page', () => {
  const LIST_STATE = { adminList: { search: 'work' } };

  let modal: { isOpen: BehaviorSubject<boolean>; open: jest.Mock };
  let tags: { getEntity: jest.Mock; getSessions: jest.Mock; updateEntity: jest.Mock; createEntity: jest.Mock; deleteEntity: jest.Mock };
  let submissions: Record<string, jest.Mock>;

  beforeEach(() => {
    // The review's "Submit Review" window answers with the email to send; nothing else on these pages opens one.
    modal = { isOpen: new BehaviorSubject(false), open: jest.fn(() => of({ poster: 'Howdy' })) };
    tags = {
      getEntity: jest.fn(() => of({ guid: 't1', name: 'Workshop' })),
      getSessions: jest.fn(() => of([])),
      updateEntity: jest.fn(() => of({})),
      createEntity: jest.fn(() => of({})),
      deleteEntity: jest.fn(() => of({}))
    };
    submissions = {
      getEntity: jest.fn(() =>
        of({ guid: 'r1', title: 'Flood maps', acceptance: false, message: '', participants: [], submissionType: 'poster' })
      ),
      previewReview: jest.fn(() => of({ groups: [] })),
      review: jest.fn(() => of({ reviewed: ['Flood maps'], failed: [] })),
      deleteEntity: jest.fn(() => of({}))
    };

    const routes: Routes = [
      {
        path: 'admin/tags',
        children: [
          { path: 'add', component: TagsAddComponent },
          { path: 'edit/:guid', component: TagsEditComponent },
          { path: '', component: ListStubComponent }
        ]
      },
      {
        path: 'admin/research-competition',
        children: [
          { path: 'review/:guid', component: ResearchCompetitionReviewComponent },
          { path: '', component: ListStubComponent }
        ]
      },
      { path: 'admin/elsewhere', component: ElsewhereStubComponent }
    ];

    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideLocationMocks(),
        { provide: TagService, useValue: tags },
        { provide: UserSubmissionsService, useValue: submissions },
        { provide: SeasonService, useValue: { activeSeason$: of({ guid: 's-2026' }) } },
        { provide: NotificationService, useValue: { toast: jest.fn() } },
        { provide: ModalService, useValue: modal }
      ]
    }).overrideComponent(ResearchCompetitionReviewComponent, {
      remove: { imports: [SubmissionFilesComponent] },
      add: { imports: [FilesStubComponent] }
    });
  });

  /** The router takes up a Back (a popstate) on a timeout of its own. */
  async function settle(harness: RouterTestingHarness) {
    await new Promise((resolve) => setTimeout(resolve));
    await harness.fixture.whenStable();
    harness.detectChanges();
  }

  /** Opens `page` from a list filtered to the 2025 season and searched for "work", as an admin would. */
  async function openedFromList(list: string, page: string) {
    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);

    // What the app's start does, and a test's does not: the router follows the browser's Back.
    router.setUpLocationChangeListener();
    await router.navigateByUrl(`${list}?season=s-2025`, { state: LIST_STATE });
    await harness.navigateByUrl(page);

    return harness;
  }

  function url() {
    return TestBed.inject(Router).url;
  }

  /** The search the list keeps in its history entry. */
  function listSearch() {
    return (TestBed.inject(Location).getState() as typeof LIST_STATE | null)?.adminList?.search;
  }

  function click(harness: RouterTestingHarness, value: string) {
    const button: HTMLInputElement = harness.routeNativeElement.querySelector(`tamu-gisc-button input[value="${value}"]`);
    button.click();
  }

  function typeName(harness: RouterTestingHarness, text: string) {
    const input: HTMLInputElement = harness.routeNativeElement.querySelector('tamu-gisc-textbox input');
    input.value = text;
    input.dispatchEvent(new Event('input'));
    harness.detectChanges();
  }

  function askedToLeave() {
    return modal.open.mock.calls.some(([component]) => component === AlertModalComponent);
  }

  describe('a form shared from gisday/platform/ngx/common: the tag', () => {
    it('Update goes back to the list it was opened from, with its season and search, without asking', async () => {
      const harness = await openedFromList('/admin/tags', '/admin/tags/edit/t1');
      typeName(harness, 'Workshops');

      click(harness, 'Update');
      await settle(harness);

      expect(tags.updateEntity).toHaveBeenCalledWith('t1', expect.objectContaining({ name: 'Workshops' }));
      expect(url()).toBe('/admin/tags?season=s-2025');
      expect(listSearch()).toBe('work');
      expect(askedToLeave()).toBe(false);
    });

    it('Delete goes back to the list it was opened from, with its season and search', async () => {
      const harness = await openedFromList('/admin/tags', '/admin/tags/edit/t1');

      click(harness, 'Delete Tag');
      await settle(harness);

      expect(tags.deleteEntity).toHaveBeenCalledWith('t1');
      expect(url()).toBe('/admin/tags?season=s-2025');
      expect(listSearch()).toBe('work');
    });

    it('Create goes back to the list it was opened from, with its season and search, without asking', async () => {
      const harness = await openedFromList('/admin/tags', '/admin/tags/add');
      typeName(harness, 'Field trip');

      click(harness, 'Create');
      await settle(harness);

      expect(tags.createEntity).toHaveBeenCalledWith(expect.objectContaining({ name: 'Field trip' }));
      expect(url()).toBe('/admin/tags?season=s-2025');
      expect(listSearch()).toBe('work');
      expect(askedToLeave()).toBe(false);
    });

    it('Update goes to the list when the page was not opened from it', async () => {
      const harness = await RouterTestingHarness.create('/admin/elsewhere');
      await harness.navigateByUrl('/admin/tags/edit/t1');

      click(harness, 'Update');
      await settle(harness);

      expect(url()).toBe('/admin/tags');
    });
  });

  describe('a page that saves itself: the submission review', () => {
    it('Submit Review goes back to the list it was opened from, with its season and search', async () => {
      const harness = await openedFromList('/admin/research-competition', '/admin/research-competition/review/r1');

      click(harness, 'Submit Review');
      await settle(harness);

      expect(submissions.review).toHaveBeenCalled();
      expect(url()).toBe('/admin/research-competition?season=s-2025');
      expect(listSearch()).toBe('work');
      expect(askedToLeave()).toBe(false);
    });

    it('Delete goes back to the list it was opened from, with its season and search', async () => {
      const harness = await openedFromList('/admin/research-competition', '/admin/research-competition/review/r1');

      click(harness, 'Delete Submission');
      await settle(harness);

      expect(submissions.deleteEntity).toHaveBeenCalledWith('r1');
      expect(url()).toBe('/admin/research-competition?season=s-2025');
      expect(listSearch()).toBe('work');
    });
  });
});
