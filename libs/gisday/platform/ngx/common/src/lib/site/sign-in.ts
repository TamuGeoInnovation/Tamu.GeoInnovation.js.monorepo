import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { AlertModalComponent, AlertModalData } from '@tamu-gisc/ui-kits/ngx/layout/modal/alert-modal';

import { GISDAY_SITE } from './site';

/**
 * Signing in, as the header's Login/Signup does it (#2662, #2700), in one place so a link or an address can start it too
 * (#3148): the FAQ page's "sign up" and "log in" links went to `/signup`, which the site had no route for, and `/login`,
 * which drew an empty page.
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
 * home page and come back there.
 */
export const startSignIn: CanActivateFn = () => {
  const router = inject(Router);
  const from = router.navigated ? router.url : '/';

  inject(SignInService).start(from);

  return router.navigated ? false : router.parseUrl('/');
};
