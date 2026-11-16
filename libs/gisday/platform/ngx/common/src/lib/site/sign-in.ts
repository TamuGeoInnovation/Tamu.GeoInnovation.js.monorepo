import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';

import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { AlertModalComponent, AlertModalData } from '@tamu-gisc/ui-kits/ngx/layout/modal/alert-modal';

import { clearApiCache } from '../utils/clear-api-cache';
import { GISDAY_SITE } from './site';

/**
 * The page a visitor already signed in sees at `/login` or `/signup` (#3154): it says so, with Continue to the site and
 * Log out, rather than sending them to Auth0 and straight back, which looked like the link did nothing.
 */
export const ALREADY_SIGNED_IN_PATH = 'signed-in';

/**
 * Signing in and out, as the header's Login/Signup and Logout do it (#2662, #2700), in one place so a link or an address
 * can start them too (#3148, #3154): the FAQ page's "sign up" and "log in" links went to `/signup`, which the site had no
 * route for, and `/login`, which drew an empty page.
 */
@Injectable({ providedIn: 'root' })
export class SignInService {
  private readonly as = inject(AuthService);
  private readonly site = inject(GISDAY_SITE);
  private readonly ms = inject(ModalService);
  private readonly rt = inject(Router);

  /**
   * Sends the visitor to sign in, and back to `target` afterwards (the page they are on, unless told otherwise). Where the
   * sign-in page is another organization's, as UCGIS's is, the site's note says so first and they may cancel (#2662).
   */
  public start(target: string = this.rt.url): void {
    const note = this.site.signInNote;

    if (!note) {
      this.signIn(target);
      return;
    }

    this.ms
      .open<boolean>(AlertModalComponent, {
        data: {
          title: note.title,
          message: note.message,
          image: this.site.logo,
          imageAlt: this.site.name,
          primaryText: 'Continue',
          secondaryText: 'Cancel'
        } satisfies AlertModalData
      })
      .subscribe((go) => {
        if (go) {
          this.signIn(target);
        }
      });
  }

  /** Logs out, back to the site's home page, clearing the API's cached answers first so the next person is not handed them. */
  public async logOut(): Promise<void> {
    await clearApiCache();

    this.as.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }

  private signIn(target: string) {
    this.as.login({
      // No `prompt=login`, on any site. On UCGIS's, Auth0 passes it on to Tradewing, which then signs the visitor in to
      // ucgis.org and never sends them back to GIS Day (#2700). So a Tradewing session left after Logout still signs
      // the next Login/Signup straight in (#2672); only Tradewing can end it.
      appState: { target }
    });
  }
}

/**
 * For `/login` and `/signup` (#3148): starts signing in instead of showing a page. Followed from a page of the site, the
 * visitor stays on it until they leave for the sign-in page, and comes back to it; reached directly, they wait on the
 * home page and come back there. A visitor already signed in is shown that they are instead (#3154).
 */
export const startSignIn: CanActivateFn = () => {
  const router = inject(Router);
  const signIn = inject(SignInService);

  return inject(AuthService).isAuthenticated$.pipe(
    take(1),
    map((signedIn) => {
      if (signedIn) {
        return router.parseUrl(`/${ALREADY_SIGNED_IN_PATH}`);
      }

      signIn.start(router.navigated ? router.url : '/');

      return router.navigated ? false : router.parseUrl('/');
    })
  );
};

/** For `/logout` (#3154): logs out, as the header's Logout does, rather than drawing an empty page. */
export const logOut: CanActivateFn = async () => {
  await inject(SignInService).logOut();

  return false;
};
