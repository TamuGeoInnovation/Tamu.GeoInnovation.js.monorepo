import type { Mock } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Angulartics2 } from 'angulartics2';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';

import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { CheckInMinutes } from '@tamu-gisc/gisday/common';
import {
  AssetsService,
  CheckinService,
  EventService,
  RsvpService,
  SeasonService,
  UserService
} from '@tamu-gisc/gisday/platform/ngx/data-access';

import { EventDetailComponent } from './event-detail.component';

/**
 * Checking in from a session's page (#1766). An in-person session at a venue with a check-in zone
 * asks for the attendee's location and sends it; the API decides. Everything else checks in as before.
 */
describe('EventDetailComponent check-in', () => {
  const zone = [
    { latitude: 30.613149134544702, longitude: -96.34032883332456 },
    { latitude: 30.61341806004229, longitude: -96.34058900760697 },
    { latitude: 30.613209152317065, longitude: -96.34093233037139 },
    { latitude: 30.612869820576215, longitude: -96.34062789963887 }
  ];
  const outsideMessage = 'You need to be inside the check-in zone at TAMU Rudder Plaza to check in to this event.';

  let getCurrentPosition: Mock;
  let fixture: { destroy: () => void } | undefined;

  beforeEach(() => {
    getCurrentPosition = vi.fn();
    Object.defineProperty(window.navigator, 'geolocation', { value: { getCurrentPosition }, configurable: true });
  });

  afterEach(() => {
    // The page polls every second while it is open.
    fixture?.destroy();
    fixture = undefined;
  });

  function open(
    mode = 'in-person',
    insert = () => of({ guid: 'c-new' }),
    schedule: { day: { guid: string; date: Date }; startTime: string; endTime: string } & CheckInMinutes = {
      day: { guid: 'd-1', date: new Date() },
      startTime: '00:00:00',
      endTime: '23:59:59'
    },
    // The page's query string, the signed-in account's roles, whether the session is open at any time
    // (#2635), what the admins' list of its check-ins and the site's users answer, and its online broadcast (#3055).
    {
      query = {},
      loggedIn = true,
      roles = [],
      anyTime = false,
      sessionCheckIns = () => of([] as Array<Record<string, unknown>>),
      users = () => of({ users: [] as Array<Record<string, unknown>>, truncated: false }),
      broadcast = undefined,
      speakers = []
    }: {
      query?: Record<string, string>;
      loggedIn?: boolean;
      roles?: Array<string>;
      anyTime?: boolean;
      sessionCheckIns?: () => Observable<unknown>;
      users?: () => Observable<unknown>;
      broadcast?: Record<string, string>;
      speakers?: Array<Record<string, unknown>>;
    } = {}
  ) {
    let checkedIn = false;

    const getCheckInCode = vi.fn(() => of({ code: 'code-1' }));
    const login = vi.fn();
    const getCheckinsForEvent = vi.fn(sessionCheckIns);
    const insertUserCheckin = vi.fn<(code: string, options?: unknown, site?: string) => ReturnType<typeof insert>>(() => {
      const result = insert();
      checkedIn = true;

      return result;
    });

    // Live all day today (Central time) unless a schedule is given, so the button shows.
    const event = {
      guid: 'e-1',
      name: 'Opening session',
      mode,
      ...schedule,
      checkInAnyTime: anyTime,
      speakers,
      location: { building: 'TAMU Rudder Plaza', checkInZone: zone },
      broadcast
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { params: of({ guid: 'e-1' }), queryParamMap: of(convertToParamMap(query)) }
        },
        {
          provide: AuthService,
          useValue: { isAuthenticated$: of(loggedIn), userRoles$: of(roles), user$: of({ sub: 'acct-1' }), login }
        },
        {
          provide: UserService,
          useValue: {
            getUserMetadata: () => of({ app_metadata: { gisday: { completedProfile: true } } }),
            getUsers: users
          }
        },
        {
          provide: EventService,
          useValue: { getEvent: () => of(event), getEventAttendance: () => of({}), updateEventAttendance: () => of({}) }
        },
        { provide: SeasonService, useValue: { isPastSeasonDay: () => of(false) } },
        { provide: RsvpService, useValue: { getUserRsvpForEvent: () => throwError(() => new Error('none')) } },
        {
          provide: CheckinService,
          useValue: {
            getUserCheckinForEvent: () => (checkedIn ? of({ guid: 'c-new' }) : throwError(() => new Error('none'))),
            insertUserCheckin,
            getCheckInCode,
            getCheckinsForEvent
          }
        },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        // A presenter card's photograph (#3196).
        { provide: AssetsService, useValue: { getAssetUrl: () => of(null) } },
        // The QR code's copyable link counts copies.
        { provide: Angulartics2, useValue: { eventTrack: { next: vi.fn() } } }
      ]
    });

    const f = TestBed.createComponent(EventDetailComponent);
    fixture = f;
    f.detectChanges();

    const page = () => f.nativeElement as HTMLElement;
    const text = () => page().textContent ?? '';

    // A button's label is its input's value, not text.
    const button = (label: string) =>
      Array.from(page().querySelectorAll<HTMLInputElement>('tamu-gisc-button input')).find((b) => b.value === label);

    const press = async (label: string) => {
      const b = button(label);

      if (!b) {
        throw new Error(`No ${label} button on the page`);
      }

      b.click();
      f.detectChanges();

      // The browser's answer arrives as a promise.
      await new Promise((resolve) => setTimeout(resolve, 0));
      f.detectChanges();
    };

    const pressCheckIn = () => press('CHECKIN');

    return {
      page,
      text,
      button,
      press,
      pressCheckIn,
      insertUserCheckin,
      getCheckInCode,
      getCheckinsForEvent,
      login,
      component: f.componentInstance,
      detectChanges: () => f.detectChanges()
    };
  }

  const at = (latitude: number, longitude: number, accuracy: number) => (success: PositionCallback) =>
    success({ coords: { latitude, longitude, accuracy } } as GeolocationPosition);

  const failsWith = (code: number) => (_: PositionCallback, error: PositionErrorCallback) =>
    error({ code, message: '', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);

  it('says the session uses location, and where', () => {
    const { text } = open();

    expect(text()).toContain('Check-in for this session uses your location: you need to be at TAMU Rudder Plaza.');
  });

  it('checks in an attendee inside the zone, sending where they are and how accurately', async () => {
    getCurrentPosition.mockImplementation(at(30.6132, -96.3406, 12));
    const { text, pressCheckIn, insertUserCheckin } = open();

    await pressCheckIn();

    // The session page never sends a QR code; that is the check-in page's (#3081).
    expect(insertUserCheckin).toHaveBeenCalledWith('e-1', { latitude: 30.6132, longitude: -96.3406, accuracy: 12 });
    expect(text()).toContain('Your attendance has been registered');
  });

  it('shows why an attendee outside the zone was refused, with no way to check in anyway', async () => {
    getCurrentPosition.mockImplementation(at(30.6101, -96.3403, 12));
    const { text, pressCheckIn } = open('in-person', () =>
      throwError(() => new HttpErrorResponse({ status: 403, error: { statusCode: 403, message: outsideMessage } }))
    );

    await pressCheckIn();

    expect(text()).toContain(outsideMessage);
    expect(text()).not.toContain('Your attendance has been registered');
    expect(text().toLowerCase()).not.toContain('anyway');
  });

  it('says it is finding the location while it waits, and sends nothing yet', async () => {
    // The browser has not answered.
    const { text, pressCheckIn, insertUserCheckin } = open();

    await pressCheckIn();

    expect(text()).toContain('Finding your location');
    expect(insertUserCheckin).not.toHaveBeenCalled();
  });

  it('reports a location that took too long as a timeout, not as blocked', async () => {
    getCurrentPosition.mockImplementation(failsWith(3));
    const { text, pressCheckIn, insertUserCheckin } = open();

    await pressCheckIn();

    expect(text()).toContain('Finding your location took too long');
    expect(text()).not.toMatch(/blocked/i);
    expect(text()).not.toContain('Finding your location…');
    expect(insertUserCheckin).not.toHaveBeenCalled();
  });

  it('asks for location access when it was refused', async () => {
    getCurrentPosition.mockImplementation(failsWith(1));
    const { text, pressCheckIn, insertUserCheckin } = open();

    await pressCheckIn();

    expect(text()).toContain('Allow this site to use your location');
    expect(insertUserCheckin).not.toHaveBeenCalled();
  });

  /**
   * #2560: a hybrid or virtual session checks in from the link in its QR code, which carries the code.
   */
  describe('a hybrid or virtual session', () => {
    const scanned = { query: { checkin: 'code-1' } };

    /** The Online Broadcast panel's line that starts with `label`, as one line of text. */
    const line = (page: HTMLElement, label: string) =>
      Array.from(page.querySelectorAll('tamu-gisc-accordion-content p'))
        .map((p) => p.textContent.replace(/\s+/g, ' ').trim())
        .find((t) => t.startsWith(label));

    it('shows the broadcast’s phone number as its dial-in number, not its password (#3055)', () => {
      const broadcast = { publicUrl: 'https://example.com/j/1', password: 'test-3055', phoneNumber: '555-0100' };
      const { page } = open('hybrid', undefined, undefined, { broadcast });

      expect(line(page(), 'Dial-in number:')).toBe('Dial-in number: 555-0100');
      expect(line(page(), 'Password:')).toBe('Password: test-3055');
    });

    it('says None for a broadcast with no dial-in number', () => {
      const { page } = open('virtual', undefined, undefined, {
        broadcast: { publicUrl: 'https://example.com/j/1', password: 'test-3055' }
      });

      expect(line(page(), 'Dial-in number:')).toBe('Dial-in number: None');
    });

    // #3081: the QR code has its own check-in page; this page never checks in by itself, code or not.
    it.each(['hybrid', 'virtual', 'in-person'])(
      'does not check in to a %s session by itself, even with a code in its address',
      (mode) => {
        const { insertUserCheckin } = open(mode, undefined, undefined, scanned);

        expect(insertUserCheckin).not.toHaveBeenCalled();
      }
    );

    // #3077: signed out, the page offered no way to sign in.
    it('offers sign-in to an attendee who is signed out, coming back to this page', async () => {
      const { text, press, login, insertUserCheckin } = open('hybrid', undefined, undefined, { loggedIn: false });

      expect(insertUserCheckin).not.toHaveBeenCalled();
      expect(text()).toContain('Sign in, or create an account, to check in to this session.');

      await press('SIGN IN');

      expect(login).toHaveBeenCalledWith({ appState: { target: TestBed.inject(Router).url } });
    });

    it('offers no Check In button, even with a code in its address, and says to scan the QR code', () => {
      const { text, button } = open('virtual', undefined, undefined, scanned);

      expect(button('CHECKIN')).toBeUndefined();
      expect(text()).toContain("Check in to this session by scanning the QR code on the presenter's slides.");
    });
  });

  /**
   * #2560: an organizer shows the QR code from the session's page, to put on the presenter's slides.
   */
  // #3220: an organizer reading a session's page can get to its edit form from there, not only from Admin → Sessions.
  describe('the Edit session button', () => {
    const editLink = (page: () => HTMLElement) =>
      Array.from(page().querySelectorAll<HTMLAnchorElement>('a')).find((a) => a.textContent?.trim() === 'Edit session');

    it.each(['GIS Day Admin', 'GIS Day Manager', 'GIS Day Organizer'])(
      "takes a %s to the session's edit form, from the top of the page",
      (role) => {
        const { page } = open('in-person', undefined, undefined, { roles: [role] });
        const link = editLink(page);
        const timeAndPlace = page().querySelector('#timeAndPlace');

        expect(link?.getAttribute('href')).toBe('/admin/events/edit/e-1');
        expect(link?.compareDocumentPosition(timeAndPlace as Node) ?? 0).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      }
    );

    it('is not shown to an attendee', () => {
      expect(editLink(open('in-person').page)).toBeUndefined();
    });

    it('is not shown to a visitor who is not signed in', () => {
      expect(editLink(open('in-person', undefined, undefined, { loggedIn: false }).page)).toBeUndefined();
    });
  });

  describe('the check-in QR code, for organizers', () => {
    const organizer = { roles: ['GIS Day Organizer'] };

    // #3081: the link is to the session's check-in page, which says whether the attendee is checked in.
    it('shows a hybrid session’s code, holding a link to its check-in page with the code', async () => {
      const { page, press, getCheckInCode } = open('hybrid', undefined, undefined, organizer);

      expect(page().querySelector('tamu-gisc-qr-code')).toBeNull();

      await press('Show check-in QR code');

      const link = `${window.location.origin}/sessions/checkin/e-1?checkin=code-1`;

      expect(getCheckInCode).toHaveBeenCalledWith('e-1');
      expect(page().querySelector('tamu-gisc-qr-code svg')?.getAttribute('aria-label')).toBe(
        'Check-in QR code for Opening session'
      );
      expect(page().querySelector('tamu-gisc-copy-field')?.textContent).toContain(link);
    });

    it('draws the code in Texas A&M maroon with the university’s logo in the middle', async () => {
      const { page, press } = open('hybrid', undefined, undefined, organizer);

      await press('Show check-in QR code');

      expect(page().querySelector('tamu-gisc-qr-code path')?.getAttribute('fill')).toBe('#500000');
      expect(page().querySelector('tamu-gisc-qr-code image')?.getAttribute('href')).toBe(
        'assets/images/logo/TAM-LogoBox.svg'
      );
    });

    it('offers to show the code full screen, for a presenter sharing their screen', async () => {
      const { page, button, press } = open('virtual', undefined, undefined, organizer);
      const requestFullscreen = vi.fn().mockResolvedValue(undefined);

      await press('Show check-in QR code');
      (page().querySelector('tamu-gisc-qr-code') as HTMLElement).requestFullscreen = requestFullscreen;

      expect(button('Full screen')).toBeDefined();
      expect(button('Download PNG')).toBeDefined();

      await press('Full screen');

      expect(requestFullscreen).toHaveBeenCalledTimes(1);
    });

    // #3077: the backup for a phone that cannot give its location.
    it('offers the code for an in-person session too, saying what it is for', () => {
      const { button, text } = open('in-person', undefined, undefined, organizer);

      expect(button('Show check-in QR code')).toBeDefined();
      expect(text()).toContain('instead of sharing their location, if their phone will not give it');
    });

    // #3197: the code is the first thing on the page under the title, so an organizer in front of a room need not scroll.
    it('puts the code at the top of the page, under the title and before the time and place', () => {
      const { page } = open('hybrid', undefined, undefined, organizer);
      const heading = Array.from(page().querySelectorAll('h3')).find((h) => h.textContent?.trim() === 'Check-in QR Code');
      const timeAndPlace = page().querySelector('#timeAndPlace');
      const title = page().querySelector('h1.session-title');

      expect(heading).toBeDefined();
      expect(timeAndPlace).not.toBeNull();
      expect(title?.compareDocumentPosition(heading as Node) ?? 0).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(heading?.compareDocumentPosition(timeAndPlace as Node) ?? 0).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('offers no code to an attendee', () => {
      const { button } = open('hybrid');

      expect(button('Show check-in QR code')).toBeUndefined();
    });
  });

  /**
   * #1795: the page shows the Check In button in the window the API accepts check-ins in, from one
   * rule in libs/gisday/common: from the start until 10 minutes after the end, the day in Central time.
   */
  describe('when the button shows', () => {
    // As the API tests: 18 November 2026, 4:00 to 5:00 PM Central, as the admin form stores them.
    const session = {
      day: { guid: 'd-1', date: new Date('2026-11-18T06:00:00Z') },
      startTime: '16:00:00 GMT-0600 (Central Standard Time)',
      endTime: '17:00:00 GMT-0600 (Central Standard Time)'
    };

    const hasButton = (text: () => string) => text().includes('Check-in to register your attendance');

    afterEach(() => {
      vi.useRealTimers();
    });

    // #3077: an attendee who scans early is told when to come back, rather than only "at the start".
    it.each([
      ['earlier that day', '2026-11-18T15:00:00Z', 'Check-in opens at 3:55 PM.'],
      ['the day before', '2026-11-17T22:30:00Z', 'Check-in opens on Wednesday, November 18 at 3:55 PM.']
    ])('before it opens, %s, says when it opens, and does not check in from the QR code', (_, now, message) => {
      vi.useFakeTimers({
        now: new Date(now),
        toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval']
      });

      const { text, insertUserCheckin } = open('hybrid', undefined, session, { query: { checkin: 'code-1' } });

      expect(text()).toContain(message);
      expect(insertUserCheckin).not.toHaveBeenCalled();
    });

    it.each([
      ['6 minutes before the start', '2026-11-18T21:54:00Z', false],
      ['5 minutes before the start', '2026-11-18T21:55:00Z', true],
      ['10 minutes after the end', '2026-11-18T23:10:00Z', true],
      ['11 minutes after the end', '2026-11-18T23:11:00Z', false]
    ])('%s: %s', (_, now, shown) => {
      vi.useFakeTimers({
        now: new Date(now),
        toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval']
      });

      const { text } = open('in-person', undefined, session);

      expect(hasButton(text)).toBe(shown);
    });

    // #3209: a session that sets its own window shows the button in that window.
    it.each([
      ['a minute before the start', '2026-11-18T21:59:00Z', false],
      ['at the start', '2026-11-18T22:00:00Z', true],
      ['30 minutes after the end', '2026-11-18T23:30:00Z', true],
      ['31 minutes after the end', '2026-11-18T23:31:00Z', false]
    ])('with its own minutes, %s: %s', (_, now, shown) => {
      vi.useFakeTimers({
        now: new Date(now),
        toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval']
      });

      const { text } = open('in-person', undefined, { ...session, checkInMinutesBefore: 0, checkInMinutesAfter: 30 });

      expect(hasButton(text)).toBe(shown);
    });

    // #2635: a session open at any time shows the button before, during and after its time.
    it.each([
      ['the day before', '2026-11-17T22:30:00Z'],
      ['6 minutes before the start', '2026-11-18T21:54:00Z'],
      ['11 minutes after the end', '2026-11-18T23:11:00Z'],
      ['a week later', '2026-11-25T22:30:00Z']
    ])('open at any time, %s: shown', (_, now) => {
      vi.useFakeTimers({
        now: new Date(now),
        toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval']
      });

      const { text } = open('in-person', undefined, session, { anyTime: true });

      expect(hasButton(text)).toBe(true);
      expect(text()).not.toContain('no longer available');
      // The zone still applies, so the page still says where to be.
      expect(text()).toContain('you need to be at TAMU Rudder Plaza');
    });
  });

  /**
   * #2635: admins see a session's check-ins on its page, each marked when made outside its time.
   */
  describe("the session's check-ins, for admins", () => {
    const admin = (overrides: Record<string, unknown> = {}) => ({ roles: ['GIS Day Admin'], ...overrides });
    const rows = (page: () => HTMLElement) =>
      Array.from(page().querySelectorAll('table.floating-table tbody tr')).map((tr) =>
        Array.from(tr.querySelectorAll('td')).map((td) => td.textContent.trim())
      );

    it('lists who checked in and when, naming them from the site users, and marks one outside the time', () => {
      const { page, getCheckinsForEvent } = open(
        'in-person',
        undefined,
        undefined,
        admin({
          anyTime: true,
          sessionCheckIns: () =>
            of([
              { accountGuid: 'auth0|late', created: '2026-11-18T23:30:00Z', outsideSessionTime: true },
              { accountGuid: 'auth0|ontime', created: '2026-11-18T22:05:00Z', outsideSessionTime: false },
              { accountGuid: 'auth0|unknown', created: '2026-11-18T22:10:00Z', outsideSessionTime: false }
            ]),
          users: () =>
            of({
              users: [
                { user_info: { id: 'auth0|late', name: 'Reveille Late', email: 'late@tamu.edu' } },
                { user_info: { id: 'auth0|ontime', email: 'ontime@tamu.edu' } }
              ],
              truncated: false
            })
        })
      );

      expect(getCheckinsForEvent).toHaveBeenCalledWith('e-1');
      expect(page().textContent).toContain('Check-in is open at any time for this session.');
      expect(rows(page)).toEqual([
        ['Reveille Late (late@tamu.edu)', 'Nov 18, 5:30 PM CST', 'Outside Session Time Check-In'],
        ['ontime@tamu.edu', 'Nov 18, 4:05 PM CST', ''],
        ['auth0|unknown', 'Nov 18, 4:10 PM CST', '']
      ]);
    });

    it("still lists the check-ins by account when the site's users cannot be read", () => {
      const { page } = open(
        'in-person',
        undefined,
        undefined,
        admin({
          sessionCheckIns: () =>
            of([{ accountGuid: 'auth0|a', created: '2026-11-18T22:05:00Z', outsideSessionTime: false }]),
          users: () => throwError(() => new HttpErrorResponse({ status: 503 }))
        })
      );

      expect(rows(page)).toEqual([['auth0|a', 'Nov 18, 4:05 PM CST', '']]);
    });

    it('says why when the account cannot read check-ins', () => {
      const { page } = open(
        'in-person',
        undefined,
        undefined,
        admin({ sessionCheckIns: () => throwError(() => new HttpErrorResponse({ status: 403 })) })
      );

      expect(page().textContent).toContain('It needs the read:checkins permission.');
    });

    it('says when nobody has checked in, and does not claim the session is open at any time when it is not', () => {
      const { page } = open('in-person', undefined, undefined, admin());

      expect(page().textContent).toContain('Nobody has checked in to this session yet.');
      expect(page().textContent).not.toContain('open at any time');
    });

    it('shows attendees no list', () => {
      const { page, getCheckinsForEvent } = open('in-person');

      expect(page().querySelector('table.floating-table')).toBeNull();
      expect(getCheckinsForEvent).not.toHaveBeenCalled();
    });
  });
  /**
   * #3196: a session's presenters are listed by last name, then first name, A to Z, and not grouped by company. Every
   * person here is made up.
   */
  describe('the presenters', () => {
    it('lists them by last name, then first name, whatever their company', async () => {
      const { component } = open('in-person', undefined, undefined, {
        speakers: [
          { guid: 's-1', firstName: 'Avery', lastName: 'Example', organization: { name: 'Zeta Mapping' } },
          { guid: 's-2', firstName: 'Jordan', lastName: 'Sample', organization: { name: 'Alpha Surveys' } },
          { guid: 's-3', firstName: 'Casey', lastName: 'Bramble' },
          { guid: 's-4', firstName: 'Blake', lastName: 'example', organization: { name: 'Alpha Surveys' } },
          { guid: 's-5', firstName: 'Robin', lastName: 'Álvarez', affiliation: 'A made-up county' }
        ]
      });
      const presenters = await firstValueFrom(component.presenters$);

      expect(presenters.map((p) => `${p.firstName} ${p.lastName}`)).toEqual([
        'Robin Álvarez',
        'Casey Bramble',
        'Avery Example',
        'Blake example',
        'Jordan Sample'
      ]);
    });
  });
});

/**
 * #3396. A session hidden from the public answers 404 to a visitor (#3354), and its page drew nothing at all. It now shows
 * the site's own not-found page, the catch-all's "We couldn't find that page.", with the address left as it was.
 */
describe('EventDetailComponent, a session the visitor may not see (#3396)', () => {
  function open(answer: () => ReturnType<typeof throwError>) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { params: of({ guid: 'e-hidden' }), queryParamMap: of(convertToParamMap({})) }
        },
        {
          provide: AuthService,
          useValue: { isAuthenticated$: of(false), userRoles$: of([]), user$: of(null), login: vi.fn() }
        },
        {
          provide: UserService,
          useValue: { getUserMetadata: () => of(null), getUsers: () => of({ users: [], truncated: false }) }
        },
        {
          provide: EventService,
          useValue: { getEvent: answer, getEventAttendance: () => of({}), updateEventAttendance: () => of({}) }
        },
        { provide: SeasonService, useValue: { isPastSeasonDay: () => of(false) } },
        { provide: RsvpService, useValue: { getUserRsvpForEvent: () => throwError(() => new Error('none')) } },
        {
          provide: CheckinService,
          useValue: {
            getUserCheckinForEvent: () => throwError(() => new Error('none')),
            insertUserCheckin: vi.fn(),
            getCheckInCode: vi.fn(),
            getCheckinsForEvent: vi.fn()
          }
        },
        { provide: NotificationService, useValue: { toast: vi.fn() } },
        { provide: AssetsService, useValue: { getAssetUrl: () => of(null) } },
        { provide: Angulartics2, useValue: { eventTrack: { next: vi.fn() } } }
      ]
    });

    const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const f = TestBed.createComponent(EventDetailComponent);
    f.detectChanges();

    return { f, navigateByUrl };
  }

  it("shows the site's not-found page, keeping the address, when the session is not found", () => {
    const { f, navigateByUrl } = open(() =>
      throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }))
    );

    expect(navigateByUrl).toHaveBeenCalledWith('/not-found', { skipLocationChange: true });
    f.destroy();
  });

  it('stays on the page for any other failure, as before', () => {
    const { f, navigateByUrl } = open(() =>
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' }))
    );

    expect(navigateByUrl).not.toHaveBeenCalled();
    f.destroy();
  });
});
