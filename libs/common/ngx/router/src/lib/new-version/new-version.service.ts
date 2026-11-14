import {
  DOCUMENT,
  DestroyRef,
  EnvironmentProviders,
  Injectable,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
  signal
} from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { filter, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { AlertModalComponent, AlertModalData } from '@tamu-gisc/ui-kits/ngx/layout/modal/alert-modal';

import { isChunkLoadError } from './chunk-load-error';

/** The page's own address, to reload it or load another (#2945). A token so a spec can stand in for it. */
export const PAGE_LOCATION = new InjectionToken<PageLocation>('PAGE_LOCATION', {
  providedIn: 'root',
  factory: () => inject(DOCUMENT).location
});

export interface PageLocation {
  reload(): void;
  assign(url: string): void;
}

/**
 * Whether the page has changes a reload would lose (#2945).
 *
 * By default, whether any form on the page has been changed: Angular marks a `<form>` it manages `ng-dirty` once
 * anything in it is edited. That errs on the safe side. A form saved without being marked pristine again still counts,
 * so the visitor is asked rather than reloaded, and a lone search box outside a form does not count at all. An app
 * with unsaved state of another kind provides its own test.
 */
export const PAGE_HAS_UNSAVED_CHANGES = new InjectionToken<() => boolean>('PAGE_HAS_UNSAVED_CHANGES', {
  providedIn: 'root',
  factory: () => {
    const document = inject(DOCUMENT);

    return () => document.querySelector('form.ng-dirty') !== null;
  }
});

/** The session storage key recording when this tab last reloaded for a missing chunk. */
const CHUNK_RELOAD_KEY = 'tamu-gisc:chunk-load-reload';

/**
 * A second missing chunk within this long of a reload for one is not reloaded for: the deployed build really lacks
 * it, and reloading again would loop. Long enough for a slow reload; short enough that the next deploy still gets one.
 */
const CHUNK_RELOAD_WINDOW_MS = 2 * 60 * 1000;

/** The service worker is asked about a newer version at most this often. */
const CHECK_GAP_MS = 30 * 1000;

/**
 * Keeps a tab that stays open across a deploy on the deployed build (#2945).
 *
 * A tab opened before a deploy keeps running the build it loaded. It either goes blank on its next click, asking for
 * a code chunk the new build no longer has, or, worse, quietly goes on showing old pages. So:
 *
 * - **A missing chunk reloads the page once**, at the address the visitor was going to. A second missing chunk soon
 *   after is left alone, so a chunk the deployed build genuinely lacks cannot loop.
 * - **A newer deployed version is noticed** by asking the Angular service worker (`SwUpdate`) whenever the visitor
 *   opens another page or comes back to the tab. The service worker compares the build's `ngsw.json` with the
 *   server's, which the server never caches.
 * - **When one is ready, the page reloads**, unless it has unsaved changes. Then it says a newer version is ready and
 *   reloads only if the visitor chooses to. Otherwise the newer version loads at the next page they open once nothing
 *   is unsaved.
 *
 * Without a service worker (a development build, or a browser without one) only the missing-chunk reload works.
 *
 * Started by {@link provideNewVersionReload}.
 */
@Injectable({ providedIn: 'root' })
export class NewVersionService {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly sw = inject(SwUpdate, { optional: true });
  private readonly modal = inject(ModalService);
  private readonly page = inject(PAGE_LOCATION);
  private readonly hasUnsavedChanges = inject(PAGE_HAS_UNSAVED_CHANGES);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  /** Whether a newer version has been downloaded and is waiting for this page to reload. */
  public readonly ready = signal(false);

  /** Set once this page is reloading, so nothing else starts another. */
  private leaving = false;
  private offered = false;
  private lastCheck = Number.NEGATIVE_INFINITY;

  public start(): void {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event instanceof NavigationError && isChunkLoadError(event.error)) {
        this.reloadForMissingChunk(event.url);
      } else if (event instanceof NavigationStart) {
        // Load the next page from the newer version, rather than draw it from this one and then reload.
        if (this.ready() && !this.hasUnsavedChanges()) {
          this.load(event.url);
        }
      } else if (event instanceof NavigationEnd) {
        this.whenReady();
        this.check();
      }
    });

    if (!this.sw?.isEnabled) {
      return;
    }

    this.sw.versionUpdates
      .pipe(
        filter((event) => event.type === 'VERSION_READY'),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.markReady());

    // This version can no longer be served, which is a newer version in all but name.
    this.sw.unrecoverable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.markReady());

    fromEvent(this.document, 'visibilitychange')
      .pipe(
        filter(() => this.document.visibilityState === 'visible'),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.whenReady();
        this.check();
      });
  }

  private markReady(): void {
    this.ready.set(true);
    this.whenReady();
  }

  /** Reloads if a newer version is ready and nothing would be lost, or offers to, once, if something would. */
  private whenReady(): void {
    if (!this.ready() || this.leaving) {
      return;
    }

    if (!this.hasUnsavedChanges()) {
      this.reload();
    } else if (!this.offered) {
      this.offered = true;
      this.offer();
    }
  }

  private offer(): void {
    this.modal
      .open<boolean>(AlertModalComponent, {
        data: {
          title: 'A newer version of this site is ready',
          message:
            'This page has changes that are not saved yet. Save them, then reload to use the newer version. ' +
            'Reloading now loses them.',
          primaryText: 'Reload now',
          secondaryText: 'Keep working'
        } satisfies AlertModalData
      })
      .subscribe((reload) => {
        if (reload) {
          this.reload();
        }
      });
  }

  private check(): void {
    if (!this.sw?.isEnabled || this.leaving || this.ready()) {
      return;
    }

    const now = Date.now();

    if (now - this.lastCheck < CHECK_GAP_MS) {
      return;
    }

    this.lastCheck = now;

    // Fails while the service worker is still registering, or offline; the next navigation asks again.
    this.sw.checkForUpdate().catch(() => false);
  }

  private reloadForMissingChunk(url: string): void {
    const now = Date.now();
    const last = Number(this.readSession(CHUNK_RELOAD_KEY));

    if (last && now - last < CHUNK_RELOAD_WINDOW_MS) {
      console.error(`${url} needs code this build does not have, and a reload did not bring it back (#2945).`);
      return;
    }

    // Without a record of this reload, the next page could not tell it had already reloaded, and could loop.
    if (!this.writeSession(CHUNK_RELOAD_KEY, String(now))) {
      console.error(`${url} needs code this build does not have; reload the page to fetch the deployed build (#2945).`);
      return;
    }

    this.load(url);
  }

  private reload(): void {
    this.leaving = true;
    this.page.reload();
  }

  private load(url: string): void {
    this.leaving = true;
    this.page.assign(this.location.prepareExternalUrl(url));
  }

  // Session storage can be missing or refuse writes (blocked site data). Without it a missing chunk is not reloaded
  // for, which is how it behaved before, rather than risk a loop.
  private readSession(key: string): string | null {
    try {
      return this.document.defaultView?.sessionStorage.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private writeSession(key: string, value: string): boolean {
    try {
      const storage = this.document.defaultView?.sessionStorage;

      storage?.setItem(key, value);

      return storage?.getItem(key) === value;
    } catch {
      return false;
    }
  }
}

/**
 * Starts {@link NewVersionService} when the app starts, so a tab left open across a deploy moves to the deployed build
 * (#2945). Provide it beside the service worker (`provideServiceWorker` or `ServiceWorkerModule.register`) and the
 * router; the app must register a view for `ModalService`, which its offer to reload opens in.
 */
export function provideNewVersionReload(): EnvironmentProviders {
  return makeEnvironmentProviders([provideAppInitializer(() => inject(NewVersionService).start())]);
}
