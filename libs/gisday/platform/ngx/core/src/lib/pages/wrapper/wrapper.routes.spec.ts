import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { gisdaySite } from '@tamu-gisc/gisday/common';
import { ALREADY_SIGNED_IN_PATH, GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';

import { NotAuthedComponent } from '../not-authed/not-authed.component';
import { wrapperRoutes } from './wrapper.routes';

/**
 * #1765. An address the site does not know matched no route: the router failed, the site went to `/` and drew a blank
 * white page, with no header and no message. It now matches a last route that says the page was not found, with links on.
 */
describe('wrapperRoutes, an unknown address', () => {
  it('ends with a catch-all route, so no address fails the router', () => {
    const children = wrapperRoutes[0].children ?? [];

    expect(children[children.length - 1].path).toBe('**');
  });

  it('says the page was not found, with links to the home page and the sessions, on the address that was asked for', async () => {
    const notFound = (wrapperRoutes[0].children ?? []).find((r) => r.path === '**');

    // The route as the wrapper has it, with its own words and links; the wrapper's header and footer are its own.
    TestBed.configureTestingModule({ providers: [provideRouter([notFound])] });

    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/no-such-page', NotAuthedComponent);
    const element = harness.routeNativeElement as HTMLElement;

    expect(page).toBeInstanceOf(NotAuthedComponent);
    expect(element.textContent).toContain("We couldn't find that page.");
    expect(Array.from(element.querySelectorAll('a')).map((a) => a.getAttribute('href'))).toEqual(['/', '/sessions']);
    // The address stays as typed, so the visitor can see what was wrong with it.
    expect(TestBed.inject(Router).url).toBe('/no-such-page');
  });
});

/**
 * #3154. A visitor already signed in who follows a "create an account" or "log in" link is told so, with a way on to the
 * site and a way to log out, rather than seeing the page they were on come back as if nothing happened.
 */
describe('wrapperRoutes, already signed in', () => {
  it('says the visitor is already signed in, as whom, with Continue to the site and Log out, under its own title', async () => {
    const signedIn = (wrapperRoutes[0].children ?? []).find((r) => r.path === ALREADY_SIGNED_IN_PATH);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([signedIn]),
        { provide: AuthService, useValue: { user$: of({ name: 'Ana Example', email: 'ana@example.com' }) } },
        { provide: GISDAY_SITE, useValue: gisdaySite('tamu') }
      ]
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/${ALREADY_SIGNED_IN_PATH}`, NotAuthedComponent);
    harness.detectChanges();
    const element = harness.routeNativeElement as HTMLElement;

    expect(element.querySelector('h1').textContent.trim()).toBe("You're already signed in");
    // As whom, from their account (the lab's report 112: the issue asks for it).
    expect(element.textContent).toContain('You are signed in as Ana Example.');
    expect(TestBed.inject(Title).getTitle()).toBe('Already signed in | Texas A&M GIS Day');
    expect(Array.from(element.querySelectorAll('a')).map((a) => [a.textContent.trim(), a.getAttribute('href')])).toEqual([
      ['Continue to the site', '/'],
      ['Log out', '/logout']
    ]);
  });
});
