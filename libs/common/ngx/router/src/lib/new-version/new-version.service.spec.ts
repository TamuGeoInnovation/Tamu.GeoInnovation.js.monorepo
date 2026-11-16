import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuardsCheckStart, Router, provideRouter } from '@angular/router';
import { SwUpdate, UnrecoverableStateEvent, VersionEvent } from '@angular/service-worker';
import { Subject, filter } from 'rxjs';

import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { AlertModalComponent } from '@tamu-gisc/ui-kits/ngx/layout/modal/alert-modal';

import { NewVersionService, PAGE_HAS_UNSAVED_CHANGES, PAGE_LOCATION } from './new-version.service';

@Component({ template: '' })
class PageComponent {}

const CHUNK_GONE = 'Failed to fetch dynamically imported module: http://localhost/chunk-OLD123.js';

const routes = [
  { path: 'page', component: PageComponent },
  { path: 'other', component: PageComponent },
  { path: 'gone', loadChildren: () => Promise.reject(new TypeError(CHUNK_GONE)) },
  { path: 'broken', loadChildren: () => Promise.reject(new Error('Something else went wrong')) }
];

const versionReady: VersionEvent = {
  type: 'VERSION_READY',
  currentVersion: { hash: 'old' },
  latestVersion: { hash: 'new' }
};

function setup({ swEnabled = true, unsaved = false } = {}) {
  const versionUpdates = new Subject<VersionEvent>();
  const unrecoverable = new Subject<UnrecoverableStateEvent>();
  const sw = { isEnabled: swEnabled, versionUpdates, unrecoverable, checkForUpdate: vi.fn().mockResolvedValue(false) };
  const page = { reload: vi.fn(), assign: vi.fn() };
  const answer = new Subject<boolean>();
  const modal = { open: vi.fn().mockReturnValue(answer) };
  const state = { unsaved };

  TestBed.resetTestingModule().configureTestingModule({
    providers: [
      provideRouter(routes),
      { provide: SwUpdate, useValue: sw },
      { provide: ModalService, useValue: modal },
      { provide: PAGE_LOCATION, useValue: page },
      { provide: PAGE_HAS_UNSAVED_CHANGES, useValue: () => state.unsaved }
    ]
  });

  TestBed.inject(NewVersionService).start();

  const router = TestBed.inject(Router);
  const go = (url: string) => router.navigateByUrl(url).catch(() => false);

  return { sw, page, modal, answer, state, versionUpdates, unrecoverable, go, router };
}

describe('NewVersionService (#2945)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  describe('a chunk the deployed build no longer has', () => {
    it('reloads at the address the visitor was going to', async () => {
      const { page, go } = setup();

      await go('/gone');

      expect(page.assign).toHaveBeenCalledTimes(1);
      expect(page.assign).toHaveBeenCalledWith('/gone');
    });

    it('reloads only once: the page that loads after the reload does not reload again for the same error', async () => {
      const first = setup();
      await first.go('/gone');
      expect(first.page.assign).toHaveBeenCalledTimes(1);

      // The reloaded page is a new app, but the same tab's session storage.
      const second = setup();
      await second.go('/gone');

      expect(second.page.assign).not.toHaveBeenCalled();
      expect(second.page.reload).not.toHaveBeenCalled();
    });

    it('reloads again for a later deploy, once the earlier reload is a few minutes old', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-11-14T15:00:00Z'));

      const first = setup();
      await first.go('/gone');

      vi.setSystemTime(new Date('2026-11-14T15:10:00Z'));

      const later = setup();
      await later.go('/gone');

      expect(later.page.assign).toHaveBeenCalledWith('/gone');
    });

    it('does not reload where the tab cannot remember having reloaded, so it cannot loop', async () => {
      const refuse = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('Blocked', 'SecurityError');
      });
      const { page, go } = setup();

      await go('/gone');

      expect(page.assign).not.toHaveBeenCalled();
      refuse.mockRestore();
    });

    it('does not reload for any other navigation error', async () => {
      const { page, go } = setup();

      await go('/broken');

      expect(page.assign).not.toHaveBeenCalled();
      expect(page.reload).not.toHaveBeenCalled();
    });

    it('reloads even where no service worker is running', async () => {
      const { page, go } = setup({ swEnabled: false });

      await go('/gone');

      expect(page.assign).toHaveBeenCalledWith('/gone');
    });
  });

  describe('a newer version deployed while the page is open', () => {
    it('asks the service worker whether there is one when the visitor moves to another page', async () => {
      const { sw, go } = setup();

      await go('/page');

      expect(sw.checkForUpdate).toHaveBeenCalledTimes(1);
    });

    it('asks at most once every 30 seconds, however fast the visitor clicks', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-11-14T15:00:00Z'));
      const { sw, go } = setup();

      await go('/page');
      await go('/other');
      expect(sw.checkForUpdate).toHaveBeenCalledTimes(1);

      vi.setSystemTime(new Date('2026-11-14T15:00:31Z'));
      await go('/page');
      expect(sw.checkForUpdate).toHaveBeenCalledTimes(2);
    });

    it('asks when the visitor comes back to the tab', () => {
      const { sw } = setup();
      const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');

      document.dispatchEvent(new Event('visibilitychange'));

      expect(sw.checkForUpdate).toHaveBeenCalledTimes(1);
      visibility.mockRestore();
    });

    it('does not ask when there is no service worker', async () => {
      const { sw, go } = setup({ swEnabled: false });

      await go('/page');

      expect(sw.checkForUpdate).not.toHaveBeenCalled();
    });

    it('reloads the page as soon as one is ready, when nothing on it is unsaved', () => {
      const { page, modal, versionUpdates } = setup();

      versionUpdates.next(versionReady);

      expect(page.reload).toHaveBeenCalledTimes(1);
      expect(modal.open).not.toHaveBeenCalled();
    });

    it('does nothing when one has only been found, and not yet downloaded', () => {
      const { page, versionUpdates } = setup();

      versionUpdates.next({ type: 'VERSION_DETECTED', version: { hash: 'new' } });

      expect(page.reload).not.toHaveBeenCalled();
    });

    it('reloads when the service worker cannot serve this version any more', () => {
      const { page, unrecoverable } = setup();

      unrecoverable.next({ type: 'UNRECOVERABLE_STATE', reason: 'Gone' });

      expect(page.reload).toHaveBeenCalledTimes(1);
    });

    it('never reloads a page with unsaved changes: it says a newer version is ready and offers a reload', () => {
      const { page, modal, versionUpdates } = setup({ unsaved: true });

      versionUpdates.next(versionReady);

      expect(page.reload).not.toHaveBeenCalled();
      expect(modal.open).toHaveBeenCalledTimes(1);
      expect(modal.open.mock.calls[0][0]).toBe(AlertModalComponent);
      expect(modal.open.mock.calls[0][1].data).toEqual(
        expect.objectContaining({
          title: 'A newer version of this site is ready',
          primaryText: 'Reload now',
          secondaryText: 'Keep working'
        })
      );
    });

    it('reloads when the visitor chooses to', () => {
      const { page, answer, versionUpdates } = setup({ unsaved: true });

      versionUpdates.next(versionReady);
      answer.next(true);

      expect(page.reload).toHaveBeenCalledTimes(1);
    });

    it('leaves the page alone when the visitor keeps working, and does not ask again', () => {
      const { page, modal, answer, versionUpdates } = setup({ unsaved: true });

      versionUpdates.next(versionReady);
      answer.next(false);
      versionUpdates.next(versionReady);

      expect(page.reload).not.toHaveBeenCalled();
      expect(modal.open).toHaveBeenCalledTimes(1);
    });

    it('once the changes are saved, loads the newer version at the next page the visitor opens', async () => {
      const { page, state, answer, versionUpdates, go } = setup({ unsaved: true });

      versionUpdates.next(versionReady);
      answer.next(false);

      state.unsaved = false;
      await go('/other');

      expect(page.assign).toHaveBeenCalledWith('/other');
    });

    it('when the changes are left behind by leaving the page, reloads on the page the visitor arrives at', async () => {
      const { page, state, answer, versionUpdates, go, router } = setup({ unsaved: true });

      versionUpdates.next(versionReady);
      answer.next(false);

      // The form is still on screen as the navigation starts, and gone once it ends.
      router.events.pipe(filter((e) => e instanceof GuardsCheckStart)).subscribe(() => (state.unsaved = false));
      await go('/other');

      expect(page.assign).not.toHaveBeenCalled();

      expect(page.reload).toHaveBeenCalledTimes(1);
    });
  });
});

describe('PAGE_HAS_UNSAVED_CHANGES default (#2945)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('is true while a form on the page has been changed', () => {
    document.body.innerHTML = '<form class="ng-touched ng-dirty ng-valid"></form>';

    expect(TestBed.resetTestingModule().inject(PAGE_HAS_UNSAVED_CHANGES)()).toBe(true);
  });

  it('is false when every form on the page is as it was loaded', () => {
    document.body.innerHTML = '<form class="ng-untouched ng-pristine ng-valid"></form><input class="ng-dirty" />';

    expect(TestBed.resetTestingModule().inject(PAGE_HAS_UNSAVED_CHANGES)()).toBe(false);
  });
});
