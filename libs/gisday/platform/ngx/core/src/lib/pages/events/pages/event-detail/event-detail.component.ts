import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  catchError,
  filter,
  interval,
  map,
  mapTo,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  takeUntil
} from 'rxjs';

import { Event, EventAttendanceDto, GisDayAppMetadata } from '@tamu-gisc/gisday/platform/data-api';
import { CheckinService, EventService, RsvpService, UserService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { GISDayRoles, parseDateStrings } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit, OnDestroy {
  public appRoles = GISDayRoles;

  public event$: Observable<Partial<Event>>;
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

  public attendanceForm: FormGroup;
  public isCheckinOpen = false;

  private _refresh$: Subject<boolean> = new Subject();
  private _destroy$: Subject<boolean> = new Subject();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly auth: AuthService,
    private readonly eventService: EventService,
    private readonly checkinService: CheckinService,
    private readonly userRsvpService: RsvpService,
    private readonly ns: NotificationService,
    private readonly us: UserService,
    private readonly fb: FormBuilder
  ) {}

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

    // Event live status is determined by taking the event season day `date` and the event start and end times.
    // Event should be live when now time is between the start and end (+ 15 minutes) times of the event day.
    // This is to account for the 15 minute buffer period after the event end time that is given to allow for
    // late checkins.
    const parsedDates = this.event$.pipe(
      map((event) => {
        const start = parseDateStrings(event?.day?.date, event?.startTime);
        const end = parseDateStrings(event?.day?.date, event?.endTime);

        end.setMinutes(end.getMinutes() + 15);

        return {
          start,
          end
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
            return now > startEndTimes.end;
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
            return now >= startEndTimes.start && now <= startEndTimes.end;
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
    this.event$
      .pipe(
        switchMap((event) => {
          return this.checkinService.insertUserCheckin(event.guid);
        })
      )
      .subscribe({
        next: () => {
          this._refresh$.next(true);
        },
        error: (err) => {
          console.log(`Error registering for event. ${err.status}: ${err.message}`);
        }
      });
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
