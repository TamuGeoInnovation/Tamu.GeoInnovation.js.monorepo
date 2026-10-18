import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
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

  function open(mode = 'in-person', insert = () => of({ guid: 'c-new' })) {
    let checkedIn = false;

    const insertUserCheckin = jest.fn<ReturnType<typeof insert>, [string, unknown?]>(() => {
      const result = insert();
      checkedIn = true;

      return result;
    });

    // Live all day today, so the button shows.
    const event = {
      guid: 'e-1',
      name: 'Opening session',
      mode,
      day: { guid: 'd-1', date: new Date() },
      startTime: '00:00:00',
      endTime: '23:59:59',
      speakers: [],
      location: { building: 'TAMU Rudder Plaza', checkInZone: zone }
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'e-1' }) } },
        {
          provide: AuthService,
          useValue: { isAuthenticated$: of(true), userRoles$: of([]), user$: of({ sub: 'acct-1' }) }
        },
        {
          provide: UserService,
          useValue: { getUserMetadata: () => of({ app_metadata: { gisday: { completedProfile: true } } }) }
        },
        { provide: EventService, useValue: { getEvent: () => of(event), getEventAttendance: () => of({}) } },
        { provide: SeasonService, useValue: { isPastSeasonDay: () => of(false) } },
        { provide: RsvpService, useValue: { getUserRsvpForEvent: () => throwError(() => new Error('none')) } },
        {
          provide: CheckinService,
          useValue: {
            getUserCheckinForEvent: () => (checkedIn ? of({ guid: 'c-new' }) : throwError(() => new Error('none'))),
            insertUserCheckin
          }
        },
        { provide: NotificationService, useValue: { toast: jest.fn() } }
      ]
    });

    const f = TestBed.createComponent(EventDetailComponent);
    fixture = f;
    f.detectChanges();

    const page = () => f.nativeElement as HTMLElement;
    const text = () => page().textContent ?? '';

    // The button's label is its input's value, not text.
    const pressCheckIn = async () => {
      const button = Array.from(page().querySelectorAll<HTMLInputElement>('tamu-gisc-button input')).find(
        (b) => b.value === 'CHECKIN'
      );

      if (!button) {
        throw new Error('No Check In button on the page');
      }

      button.click();
      f.detectChanges();

      // The browser's answer arrives as a promise.
      await new Promise((resolve) => setTimeout(resolve, 0));
      f.detectChanges();
    };

    return { text, pressCheckIn, insertUserCheckin, detectChanges: () => f.detectChanges() };
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

  it('checks in to a hybrid session without asking for location', async () => {
    const { text, pressCheckIn, insertUserCheckin } = open('hybrid');

    expect(text()).not.toContain('uses your location');

    await pressCheckIn();

    expect(getCurrentPosition).not.toHaveBeenCalled();
    expect(insertUserCheckin.mock.calls[0][0]).toBe('e-1');
    expect(insertUserCheckin.mock.calls[0][1]).toBeUndefined();
    expect(text()).toContain('Your attendance has been registered');
  });
});
