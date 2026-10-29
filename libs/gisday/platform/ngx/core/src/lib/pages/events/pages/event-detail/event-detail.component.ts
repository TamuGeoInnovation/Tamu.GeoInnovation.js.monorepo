import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  catchError,
  filter,
  finalize,
  interval,
  map,
  mapTo,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  take,
  takeUntil
} from 'rxjs';

import { Event, EventAttendanceDto, GisDayAppMetadata, Speaker } from '@tamu-gisc/gisday/platform/data-api';
import {
  CheckinService,
  EventService,
  RsvpService,
  SeasonService,
  UserService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { GISDayRoles, sortSpeakersByAffiliation } from '@tamu-gisc/gisday/platform/ngx/common';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { AccordionComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { PresenterCardComponent } from '@tamu-gisc/gisday/platform/ngx/common';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ParseDateTimeStringsPipe } from '@tamu-gisc/gisday/platform/ngx/common';
import { MarkdownParsePipe } from '@tamu-gisc/common/ngx/pipes';
import { getGeolocation, isLatLonPolygon } from '@tamu-gisc/common/utils/geometry';
import {
  CHECK_IN_CODE_MESSAGE,
  CHECK_IN_CODE_PARAM,
  CHECK_IN_ZONE_EVENT_MODE,
  checkInWindow,
  checksInByCode
} from '@tamu-gisc/gisday/common';
import { SiteHasPipe } from '@tamu-gisc/gisday/platform/ngx/common';
import { QrCodeComponent } from '@tamu-gisc/ui-kits/ngx/qr-code';
import { CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

@Component({
  selector: 'tamu-gisc-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'],
  imports: [
    SiteHasPipe,
    NgIf,
    AccordionComponent,
    AccordionHeaderComponent,
    AccordionContentComponent,
    ButtonComponent,
    RouterLink,
    NgFor,
    PresenterCardComponent,
    FormsModule,
    ReactiveFormsModule,
    TextboxComponent,
    AsyncPipe,
    DatePipe,
    ParseDateTimeStringsPipe,
    MarkdownParsePipe,
    QrCodeComponent,
    CopyComponent
  ]
})
export class EventDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly eventService = inject(EventService);
  private readonly checkinService = inject(CheckinService);
  private readonly userRsvpService = inject(RsvpService);
  private readonly ns = inject(NotificationService);
  private readonly us = inject(UserService);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly seasonService = inject(SeasonService);

  public appRoles = GISDayRoles;

  public event$: Observable<Partial<Event>>;
  public presenters$: Observable<Array<Partial<Speaker>>>;
  public isLoggedIn$: Observable<boolean> = this.auth.isAuthenticated$;
  public userInfo$: Observable<Partial<GisDayAppMetadata>>;
  public userProfileComplete$: Observable<boolean>;
  public userRsvp$: Observable<boolean>;
  public userCheckedIn$: Observable<boolean>;
  public userRoles$: Observable<Array<string>>;
  public eventAttendance$: Observable<EventAttendanceDto>;
  public isModerator$: Observable<boolean> = this.auth.userRoles$.pipe(
    map((roles) => {
      return [this.appRoles.ADMIN, this.appRoles.MANAGER, this.appRoles.ORGANIZER].some((role) => roles.includes(role));
    })
  );
  public eventLive$: Observable<boolean>;
  public eventElapsed$: Observable<boolean>;
  public isPastSeason$: Observable<boolean>;

  public attendanceForm: UntypedFormGroup;
  /**
   * Waiting for the browser to say where the attendee is, for a session that checks location.
   */
  public readonly findingLocation = signal(false);

  /**
   * Why the last check-in did not work, shown beside the button.
   */
  public readonly checkInFailure = signal<string>(undefined);

  /**
   * The code from the session's QR code, which its link carries (#2560). A hybrid or virtual session
   * offers the Check In button only with it.
   */
  public readonly checkInCode = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get(CHECK_IN_CODE_PARAM) ?? undefined)),
    { initialValue: undefined }
  );

  public readonly checkInCodeMessage = CHECK_IN_CODE_MESSAGE;

  /**
   * The check-in QR code in Texas A&M maroon, with the university's box logo in the middle, from the
   * shared assets every GIS Day site serves (as the header lockup uses).
   */
  public readonly checkInCodeColor = '#500000';
  public readonly checkInCodeLogo = 'assets/images/logo/TAM-LogoBox.svg';

  /**
   * The link in the session's check-in QR code, once an organizer has asked for it (#2560).
   */
  public readonly checkInLink = signal<string>(undefined);

  /**
   * Why the check-in QR code could not be shown, such as an account without `create:checkins`.
   */
  public readonly checkInCodeFailure = signal<string>(undefined);

  private _refresh$: Subject<boolean> = new Subject();
  private _destroy$: Subject<boolean> = new Subject();

  public ngOnInit(): void {
    this.attendanceForm = this.fb.group({
      observedAttendeeStart: [null],
      observedAttendeeEnd: [null]
    });

    this.userRoles$ = this.auth.userRoles$;
    this.userInfo$ = this.auth.isAuthenticated$.pipe(
      filter((auth) => {
        return auth === true;
      }),
      switchMap(() => {
        return this.auth.user$;
      }),
      switchMap((user) => {
        return this.us.getUserMetadata(user.sub);
      }),
      shareReplay()
    );

    this.userProfileComplete$ = this.userInfo$.pipe(
      map((user) => {
        return user?.app_metadata?.gisday?.completedProfile === true;
      }),
      shareReplay()
    );

    this.event$ = this.route.params.pipe(
      map((params) => params['guid']),
      switchMap((eventGuid) => this.eventService.getEvent(eventGuid)),
      shareReplay()
    );

    // Grouped by company, then by name, so the people from one company sit together (#1769).
    this.presenters$ = this.event$.pipe(map((event) => sortSpeakersByAffiliation(event?.speakers)));

    this.isPastSeason$ = this.event$.pipe(
      switchMap((event) => this.seasonService.isPastSeasonDay(event?.day?.guid)),
      shareReplay()
    );

    this.userRsvp$ = this._refresh$.pipe(
      startWith(true),
      switchMap(() => {
        return this.event$.pipe(
          switchMap((event) => {
            return this.userRsvpService.getUserRsvpForEvent(event.guid).pipe(mapTo(true));
          }),
          catchError(() => {
            return of(false);
          })
        );
      }),
      shareReplay()
    );

    this.userCheckedIn$ = this._refresh$.pipe(
      startWith(true),
      switchMap(() => {
        return this.event$.pipe(
          switchMap((event) => {
            return this.checkinService.getUserCheckinForEvent(event.guid).pipe(mapTo(true));
          }),
          catchError(() => {
            return of(false);
          })
        );
      }),
      shareReplay()
    );

    this.eventAttendance$ = this._refresh$.pipe(
      startWith(true),
      switchMap(() => {
        return this.event$.pipe(
          switchMap((event) => {
            return interval(10000).pipe(
              startWith(0),
              switchMap(() => {
                return this.eventService.getEventAttendance(event.guid);
              })
            );
          })
        );
      })
    );

    this.isModerator$
      .pipe(
        filter((isModerator) => isModerator),
        switchMap(() => {
          return this.eventAttendance$;
        }),
        takeUntil(this._destroy$)
      )
      .subscribe((at) => {
        this.attendanceForm.patchValue({
          observedAttendeeStart: at.observedAttendeeStart ? at.observedAttendeeStart : 0,
          observedAttendeeEnd: at.observedAttendeeEnd ? at.observedAttendeeEnd : 0
        });
      });

    // Check-in is open from the session's start until 15 minutes after its end: the same rule the API
    // applies (#1795), from libs/gisday/common. A time that cannot be read (#1772) means the session is
    // never live, rather than an error.
    const parsedDates = this.event$.pipe(
      map((event) => {
        const window = checkInWindow(event?.day?.date, event?.startTime, event?.endTime);

        return {
          start: window?.opens ?? null,
          end: window?.closes ?? null
        };
      }),
      shareReplay()
    );

    this.eventElapsed$ = parsedDates.pipe(
      switchMap((startEndTimes) => {
        return interval(1000).pipe(
          startWith(0),
          map(() => {
            const now = new Date();
            return startEndTimes.end !== null && now > startEndTimes.end;
          })
        );
      })
    );

    this.eventLive$ = parsedDates.pipe(
      switchMap((startEndTimes) => {
        return interval(1000).pipe(
          startWith(0),
          map(() => {
            const now = new Date();
            return (
              startEndTimes.start !== null &&
              startEndTimes.end !== null &&
              now >= startEndTimes.start &&
              now <= startEndTimes.end
            );
          })
        );
      })
    );
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public register() {
    this.event$
      .pipe(
        switchMap((event) => {
          return this.userRsvpService.createRsvp(event.guid);
        })
      )
      .subscribe({
        next: () => {
          this._toastEventRegistrationSuccess();
          this._refresh$.next(true);
        },
        error: (err) => {
          this._toastEventRegistrationFailure();
          console.log(`Error registering for event. ${err.status}: ${err.message}`);
        }
      });
  }

  public unregister() {
    this.event$
      .pipe(
        switchMap((event) => {
          return this.userRsvpService.deleteEntity(event.guid);
        })
      )
      .subscribe({
        next: () => {
          this._toastEventUnregistrationSuccess();
          this._refresh$.next(true);
        },
        error: (err) => {
          this._toastEventUnregistrationFailure();
          console.log(`Error unregistering for event. ${err.status}: ${err.message}`);
        }
      });
  }

  public checkin() {
    this.checkInFailure.set(undefined);

    this.event$
      .pipe(
        take(1),
        switchMap((event) =>
          this._checkInPosition(event).pipe(
            switchMap((position) =>
              this.checkinService.insertUserCheckin(
                event.guid,
                position,
                this.needsCheckInCode(event) ? this.checkInCode() : undefined
              )
            )
          )
        )
      )
      .subscribe({
        next: () => {
          this._refresh$.next(true);
        },
        error: (err) => {
          this.checkInFailure.set(checkInFailureMessage(err));
        }
      });
  }

  /**
   * Whether checking in to this event needs the attendee's location: an in-person event at a
   * location with a check-in zone (#1766). The API makes the same decision, and decides whether
   * the location is inside the zone.
   */
  public needsCheckInLocation(event: Partial<Event>): boolean {
    return event?.mode === CHECK_IN_ZONE_EVENT_MODE && isLatLonPolygon(event?.location?.checkInZone);
  }

  /**
   * Whether checking in to this event needs the code in its QR code: a hybrid or virtual session
   * (#2560). The API makes the same decision, and checks the code.
   */
  public needsCheckInCode(event: Partial<Event>): boolean {
    return checksInByCode(event?.mode);
  }

  /**
   * Shows an organizer the session's check-in QR code, which holds a link to this page with the code.
   */
  public showCheckInCode(event: Partial<Event>) {
    this.checkInCodeFailure.set(undefined);

    this.checkinService.getCheckInCode(event.guid).subscribe({
      next: ({ code }) => {
        const link = new URL(`/sessions/details/${event.guid}`, window.location.origin);
        link.searchParams.set(CHECK_IN_CODE_PARAM, code);

        this.checkInLink.set(link.toString());
      },
      error: (err) => {
        this.checkInCodeFailure.set(
          err instanceof HttpErrorResponse && err.status === 403
            ? 'Your account cannot make check-in codes. It needs the create:checkins permission.'
            : (err?.error?.message ?? 'The check-in QR code could not be loaded. Please try again.')
        );
      }
    });
  }

  /**
   * Where the attendee is, and how accurately, when the event needs it; nothing otherwise.
   */
  private _checkInPosition(event: Partial<Event>): Observable<{ latitude: number; longitude: number; accuracy: number }> {
    if (!this.needsCheckInLocation(event)) {
      return of(undefined);
    }

    this.findingLocation.set(true);

    return getGeolocation(true, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }).pipe(
      map((coords) => ({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy })),
      finalize(() => this.findingLocation.set(false))
    );
  }

  public updateAttendance() {
    this.event$
      .pipe(
        switchMap((event) => {
          return this.eventService.updateEventAttendance(event.guid, this.attendanceForm.value);
        })
      )
      .subscribe({
        next: () => {
          this._toastAttendanceUpdateSuccess();
          this._refresh$.next(true);
        },
        error: (err) => {
          this._toastAttendanceUpdateFailure();
          console.log(`Error updating attendance. ${err.status}: ${err.message}`);
        }
      });
  }

  private _toastEventRegistrationSuccess() {
    this.ns.toast({
      message: 'You have successfully registered for this event.',
      id: 'gisday-register-success',
      title: 'Event Registration'
    });
  }

  private _toastEventUnregistrationSuccess() {
    this.ns.toast({
      message: 'You have successfully unregistered for this event.',
      id: 'gisday-unregister-success',
      title: 'Event Registration'
    });
  }

  private _toastEventRegistrationFailure() {
    this.ns.toast({
      message: 'Could not register for event. Please try again later',
      id: 'gisday-register-failure',
      title: 'Event Registration'
    });
  }

  private _toastEventUnregistrationFailure() {
    this.ns.toast({
      message: 'Could not unregister for event. Please try again later',
      id: 'gisday-unregister-failure',
      title: 'Event Registration'
    });
  }

  private _toastAttendanceUpdateSuccess() {
    this.ns.toast({
      message: 'Successfully updated the attendance for this event.',
      id: 'gisday-attendance-update-success',
      title: 'Attendance Update'
    });
  }

  private _toastAttendanceUpdateFailure() {
    this.ns.toast({
      message: 'Could not update attendance. Please try again later',
      id: 'gisday-attendance-update-failure',
      title: 'Attendance Update'
    });
  }
}

/**
 * What to tell an attendee whose check-in did not work: the API's reason, such as being outside the
 * check-in zone, or why their location could not be found.
 */
function checkInFailureMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    return err.error?.message ?? 'Check-in did not work. Please try again.';
  }

  switch ((err as GeolocationPositionError)?.code) {
    case 1:
      return 'Check-in for this session needs your location. Allow this site to use your location, then try again.';
    case 3:
      return 'Finding your location took too long. Try again, near a window or outdoors if you can.';
    default:
      return 'Your location could not be found. Turn on location services, then try again.';
  }
}
