import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Angulartics2 } from 'angulartics2';
import { of, throwError } from 'rxjs';

import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import {
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

  let getCurrentPosition: jest.Mock;
  let fixture: { destroy: () => void } | undefined;

  beforeEach(() => {
    getCurrentPosition = jest.fn();
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
    schedule: { day: { guid: string; date: Date }; startTime: string; endTime: string } = {
      day: { guid: 'd-1', date: new Date() },
      startTime: '00:00:00',
      endTime: '23:59:59'
    },
    // The page's query string, and the signed-in account's roles.
    { query = {}, roles = [] }: { query?: Record<string, string>; roles?: Array<string> } = {}
  ) {
    let checkedIn = false;

    const getCheckInCode = jest.fn(() => of({ code: 'code-1' }));
    const insertUserCheckin = jest.fn<ReturnType<typeof insert>, [string, unknown?, string?]>(() => {
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
      speakers: [],
      location: { building: 'TAMU Rudder Plaza', checkInZone: zone }
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
          useValue: { isAuthenticated$: of(true), userRoles$: of(roles), user$: of({ sub: 'acct-1' }) }
        },
        {
          provide: UserService,
          useValue: { getUserMetadata: () => of({ app_metadata: { gisday: { completedProfile: true } } }) }
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
            getCheckInCode
          }
        },
        { provide: NotificationService, useValue: { toast: jest.fn() } },
        // The QR code's copyable link counts copies.
        { provide: Angulartics2, useValue: { eventTrack: { next: jest.fn() } } }
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

    // An in-person session sends no QR code (#2560).
    expect(insertUserCheckin).toHaveBeenCalledWith(
      'e-1',
      { latitude: 30.6132, longitude: -96.3406, accuracy: 12 },
      undefined
    );
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

    it.each(['hybrid', 'virtual'])(
      'checks in to a %s session from its QR code, sending the code and no location',
      async (mode) => {
        const { text, pressCheckIn, insertUserCheckin } = open(mode, undefined, undefined, scanned);

        expect(text()).not.toContain('uses your location');

        await pressCheckIn();

        expect(getCurrentPosition).not.toHaveBeenCalled();
        expect(insertUserCheckin).toHaveBeenCalledWith('e-1', undefined, 'code-1');
        expect(text()).toContain('Your attendance has been registered');
      }
    );

    it('offers no Check In button without the code, and says to scan it', () => {
      const { text, button } = open('virtual');

      expect(button('CHECKIN')).toBeUndefined();
      expect(text()).toContain("Check in to this session by scanning the QR code on the presenter's slides.");
    });

    it('shows why a code was refused', async () => {
      const refused = "Check in to this session by scanning the QR code on the presenter's slides.";
      const { text, pressCheckIn } = open(
        'hybrid',
        () => throwError(() => new HttpErrorResponse({ status: 403, error: { statusCode: 403, message: refused } })),
        undefined,
        { query: { checkin: 'from-another-session' } }
      );

      await pressCheckIn();

      expect(text()).toContain(refused);
      expect(text()).not.toContain('Your attendance has been registered');
    });

    it('sends no code for an in-person session, even when the address has one', async () => {
      const { pressCheckIn, insertUserCheckin } = open('in-person', undefined, undefined, {
        query: { checkin: 'code-1' }
      });
      getCurrentPosition.mockImplementation(at(30.6132, -96.3406, 12));

      await pressCheckIn();

      expect(insertUserCheckin.mock.calls[0][2]).toBeUndefined();
    });
  });

  /**
   * #2560: an organizer shows the QR code from the session's page, to put on the presenter's slides.
   */
  describe('the check-in QR code, for organizers', () => {
    const organizer = { roles: ['GIS Day Organizer'] };

    it('shows a hybrid session’s code, holding a link to this page with the code', async () => {
      const { page, press, getCheckInCode } = open('hybrid', undefined, undefined, organizer);

      expect(page().querySelector('tamu-gisc-qr-code')).toBeNull();

      await press('Show check-in QR code');

      const link = `${window.location.origin}/sessions/details/e-1?checkin=code-1`;

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
      const requestFullscreen = jest.fn().mockResolvedValue(undefined);

      await press('Show check-in QR code');
      (page().querySelector('tamu-gisc-qr-code') as HTMLElement).requestFullscreen = requestFullscreen;

      expect(button('Full screen')).toBeDefined();
      expect(button('Download PNG')).toBeDefined();

      await press('Full screen');

      expect(requestFullscreen).toHaveBeenCalledTimes(1);
    });

    it('offers no code for an in-person session, which checks in by location', () => {
      const { button } = open('in-person', undefined, undefined, organizer);

      expect(button('Show check-in QR code')).toBeUndefined();
    });

    it('offers no code to an attendee', () => {
      const { button } = open('hybrid');

      expect(button('Show check-in QR code')).toBeUndefined();
    });
  });

  /**
   * #1795: the page shows the Check In button in the window the API accepts check-ins in, from one
   * rule in libs/gisday/common: from the start until 15 minutes after the end, the day in Central time.
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
      jest.useRealTimers();
    });

    it.each([
      ['a minute before the start', '2026-11-18T21:59:00Z', false],
      ['at the start', '2026-11-18T22:00:00Z', true],
      ['15 minutes after the end', '2026-11-18T23:15:00Z', true],
      ['16 minutes after the end', '2026-11-18T23:16:00Z', false]
    ])('%s: %s', (_, now, shown) => {
      jest.useFakeTimers({ now: new Date(now), doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });

      const { text } = open('in-person', undefined, session);

      expect(hasButton(text)).toBe(shown);
    });
  });
});
