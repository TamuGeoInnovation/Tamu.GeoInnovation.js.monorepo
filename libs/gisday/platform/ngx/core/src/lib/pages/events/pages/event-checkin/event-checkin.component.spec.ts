import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { CheckinService, EventService, UserService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { EventCheckinComponent } from './event-checkin.component';

/**
 * #3081. A session's QR code opened the session's own page, which checked the attendee in with nothing on the first
 * screen to say so, and signed out showed a button below the fold. The code now opens a page of its own that says, in
 * words, whether the attendee is checked in, and why not, with a button on to the session.
 */
describe('EventCheckinComponent', () => {
  afterEach(() => sessionStorage.clear());

  function open({
    code = 'code-1' as string | null,
    event = () => of({ guid: 'e-1', name: 'Opening session', mode: 'hybrid' }) as Observable<unknown>,
    loggedIn = true,
    profileComplete = true,
    alreadyCheckedIn = false,
    insert = () => of({ guid: 'c-new' }) as Observable<unknown>
  } = {}) {
    const insertUserCheckin = jest.fn(insert);
    const login = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ guid: 'e-1' }),
              queryParamMap: convertToParamMap(code ? { checkin: code } : {})
            }
          }
        },
        { provide: AuthService, useValue: { isAuthenticated$: of(loggedIn), user$: of({ sub: 'acct-1' }), login } },
        {
          provide: UserService,
          useValue: { getUserMetadata: () => of({ app_metadata: { gisday: { completedProfile: profileComplete } } }) }
        },
        { provide: EventService, useValue: { getEvent: jest.fn(event) } },
        {
          provide: CheckinService,
          useValue: {
            getUserCheckinForEvent: () => (alreadyCheckedIn ? of({ guid: 'c-old' }) : throwError(() => new Error('none'))),
            insertUserCheckin
          }
        }
      ]
    });

    const fixture = TestBed.createComponent(EventCheckinComponent);
    fixture.detectChanges();

    const text = () => (fixture.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ') ?? '';
    const button = (label: string) =>
      Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>('tamu-gisc-button input')).find(
        (b) => b.value === label
      );

    return { fixture, text, button, insertUserCheckin, login };
  }

  it('checks the attendee in with the code and no location, and says so in words', () => {
    const { text, insertUserCheckin } = open();

    expect(insertUserCheckin).toHaveBeenCalledWith('e-1', undefined, 'code-1');
    expect(text()).toContain("You're checked in");
    expect(text()).toContain('Opening session');
  });

  it('offers a button on to the session, and does not move on by itself', () => {
    const { button } = open();

    expect(button('Go to the session')).toBeDefined();
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('says so when the attendee was already checked in, and checks in no second time', () => {
    const { text, insertUserCheckin } = open({ alreadyCheckedIn: true });

    expect(insertUserCheckin).not.toHaveBeenCalled();
    expect(text()).toContain("You're already checked in");
  });

  it('says why a check-in was refused, in the API’s words', () => {
    const { text } = open({
      insert: () =>
        throwError(
          () =>
            new HttpErrorResponse({
              status: 403,
              error: { message: 'Check-in for this session opens when it starts, at 2:00 PM.' }
            })
        )
    });

    expect(text()).toContain('You are not checked in');
    expect(text()).toContain('Check-in for this session opens when it starts, at 2:00 PM.');
    expect(text()).not.toContain("You're checked in");
  });

  it('says what to do when a refusal gives no reason', () => {
    const { text } = open({ insert: () => throwError(() => new Error('network')) });

    expect(text()).toContain('Check-in did not work. Scan the code again, or ask a GIS Day organizer for help.');
  });

  it('sends a signed-out attendee to sign-in, coming back to this page with the code', () => {
    const { text, login, insertUserCheckin } = open({ loggedIn: false });

    expect(insertUserCheckin).not.toHaveBeenCalled();
    expect(login).toHaveBeenCalledWith({ appState: { target: TestBed.inject(Router).url } });
    expect(text()).toContain('Taking you to sign in');
  });

  // #3089: SIGN IN and Go to the session sat side by side with no gap.
  it('stacks SIGN IN above Go to the session, each in its own row', () => {
    sessionStorage.setItem('gisday-checkin-sign-in:code-1', '1');

    const { fixture } = open({ loggedIn: false });
    const rows = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.checkin-actions > *'));

    expect(rows.map((r) => r.querySelector('input')?.value)).toEqual(['SIGN IN', 'Go to the session']);
  });

  it('sends them only once per scan, so someone who cancels sign-in sees why and a SIGN IN button', () => {
    sessionStorage.setItem('gisday-checkin-sign-in:code-1', '1');

    const { text, login, button } = open({ loggedIn: false });

    expect(login).not.toHaveBeenCalled();
    expect(text()).toContain('You are not checked in yet');
    expect(button('SIGN IN')).toBeDefined();
  });

  it('asks for a complete profile before checking in', () => {
    const { text, insertUserCheckin } = open({ profileComplete: false });

    expect(insertUserCheckin).not.toHaveBeenCalled();
    expect(text()).toContain('Complete your profile first, then scan the QR code again.');
  });

  it('says so when the link has no code', () => {
    const { text, insertUserCheckin } = open({ code: null });

    expect(insertUserCheckin).not.toHaveBeenCalled();
    expect(text()).toContain('This link has no check-in code.');
  });

  // #2572: the page takes the code out of the address before Analytics sees it, and keeps it for this page.
  it('checks in with the code the page kept when it took it out of the address', () => {
    history.replaceState(null, '', '/sessions/e-1/checkin');
    sessionStorage.setItem('gisday-checkin-code:/sessions/e-1/checkin', 'code-2');

    const { text, insertUserCheckin } = open({ code: null });

    expect(insertUserCheckin).toHaveBeenCalledWith('e-1', undefined, 'code-2');
    expect(text()).toContain("You're checked in");
    history.replaceState(null, '', '/');
  });

  it('does not use a code kept for another session', () => {
    history.replaceState(null, '', '/sessions/e-1/checkin');
    sessionStorage.setItem('gisday-checkin-code:/sessions/e-2/checkin', 'code-2');

    const { text, insertUserCheckin } = open({ code: null });

    expect(insertUserCheckin).not.toHaveBeenCalled();
    expect(text()).toContain('This link has no check-in code.');
    history.replaceState(null, '', '/');
  });

  it('says so when the session cannot be found', () => {
    const { text, insertUserCheckin } = open({ event: () => throwError(() => new HttpErrorResponse({ status: 404 })) });

    expect(insertUserCheckin).not.toHaveBeenCalled();
    expect(text()).toContain('This session could not be found.');
  });
});
