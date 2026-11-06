import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';

import { gisdaySite, GisdaySite } from '@tamu-gisc/gisday/common';
import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { AlertModalComponent } from '@tamu-gisc/ui-kits/ngx/layout/modal/alert-modal';

import { GISDAY_SITE } from '../../site/site';
import { HeaderComponent } from './header.component';

/**
 * #2662. On a site with a sign-in note, Login/Signup shows the note with the site's logo first, and signs in only on
 * Continue. A site without one signs in at once.
 */
describe('HeaderComponent login', () => {
  function setUp(site: GisdaySite) {
    const login = jest.fn();
    const answer = new Subject<boolean | undefined>();
    const open = jest.fn(() => answer);

    const header = TestBed.configureTestingModule({
      providers: [
        { provide: GISDAY_SITE, useValue: site },
        { provide: AuthService, useValue: { login } },
        { provide: ModalService, useValue: { open } },
        { provide: SeasonService, useValue: {} },
        { provide: PlaceService, useValue: {} },
        { provide: Router, useValue: { url: '/sessions' } },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).runInInjectionContext(() => new HeaderComponent());

    return { header, login, open, answer };
  }

  it("shows UCGIS's note with its logo, and signs in on Continue", () => {
    const { header, login, open, answer } = setUp(gisdaySite('ucgis'));

    header.login();

    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0][0]).toBe(AlertModalComponent);
    expect(open.mock.calls[0][1].data).toMatchObject({
      title: 'Sign in with your UCGIS account',
      image: gisdaySite('ucgis').logo,
      primaryText: 'Continue'
    });
    expect(login).not.toHaveBeenCalled();

    answer.next(true);

    expect(login).toHaveBeenCalledWith({ appState: { target: '/sessions' }, authorizationParams: { prompt: 'login' } });
  });

  it('does not sign in when the note is cancelled or closed', () => {
    const { header, login, answer } = setUp(gisdaySite('ucgis'));

    header.login();
    answer.next(false);
    answer.next(undefined);

    expect(login).not.toHaveBeenCalled();
  });

  it('signs in at once on txgisday.org, with no note', () => {
    const { header, login, open } = setUp(gisdaySite('txgisday'));

    header.login();

    expect(open).not.toHaveBeenCalled();
    expect(login).toHaveBeenCalledWith({ appState: { target: '/sessions' } });
  });
});

/**
 * #2672. Logout cannot end UCGIS's Tradewing session, so on UCGIS's site every sign-in asks Tradewing for the password
 * (`prompt=login`). txgisday.org and Texas A&M's site sign in as before, and no site logs out of its provider.
 */
describe('HeaderComponent sign-in and logout on a site that signs in elsewhere', () => {
  function headerOn(site: GisdaySite) {
    const login = jest.fn();
    const logout = jest.fn();

    // Called for more than one site in a test, so each call starts from a fresh test module.
    TestBed.resetTestingModule();
    const header = TestBed.configureTestingModule({
      providers: [
        { provide: GISDAY_SITE, useValue: site },
        { provide: AuthService, useValue: { login, logout } },
        { provide: ModalService, useValue: { open: () => of(true) } },
        { provide: SeasonService, useValue: {} },
        { provide: PlaceService, useValue: {} },
        { provide: Router, useValue: { url: '/sessions' } },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).runInInjectionContext(() => new HeaderComponent());

    return { header, login, logout };
  }

  it('asks Tradewing for the password on every UCGIS sign-in', () => {
    const { header, login } = headerOn(gisdaySite('ucgis'));

    header.login();

    expect(login).toHaveBeenCalledWith({ appState: { target: '/sessions' }, authorizationParams: { prompt: 'login' } });
  });

  it("signs in as before on txgisday.org and Texas A&M's site", () => {
    for (const key of ['txgisday', 'tamu']) {
      const { header, login } = headerOn(gisdaySite(key));

      header.login();

      expect(login).toHaveBeenCalledWith({ appState: { target: '/sessions' } });
    }
  });

  it('logs out of the site only, on every site', () => {
    for (const key of ['ucgis', 'txgisday', 'tamu']) {
      const { header, logout } = headerOn(gisdaySite(key));

      header.logout();

      expect(logout).toHaveBeenCalledWith({ logoutParams: { returnTo: window.location.origin } });
    }
  });
});
