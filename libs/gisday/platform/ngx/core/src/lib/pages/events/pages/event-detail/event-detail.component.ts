import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  catchError,
  filter,
  map,
  mapTo,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  withLatestFrom
} from 'rxjs';

import { Event } from '@tamu-gisc/gisday/platform/data-api';
import { CheckinService, EventService, RsvpService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  public $event: Observable<Partial<Event>>;
  public isLoggedIn$: Observable<boolean> = this.auth.isAuthenticated$;
  public userRsvp$: Observable<boolean>;

  public numOfRsvps: Observable<number>;
  public userHasCheckedInAlready: Observable<boolean>;
  public isCheckinOpen = false;
  public now: Date = new Date();

  private _refresh$: Subject<boolean> = new Subject();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly auth: AuthService,
    private readonly eventService: EventService,
    private readonly checkinService: CheckinService,
    private readonly userRsvpService: RsvpService,
    private readonly ns: NotificationService
  ) {}

  public ngOnInit(): void {
    this.$event = this.route.params.pipe(
      map((params) => params['guid']),
      switchMap((eventGuid) => this.eventService.getEvent(eventGuid)),
      shareReplay()
    );

    this.userRsvp$ = this._refresh$.pipe(
      startWith(true),
      switchMap(() => {
        return this.isLoggedIn$.pipe(
          filter((loggedIn) => loggedIn),
          withLatestFrom(this.$event),
          switchMap(([, event]) => {
            return this.userRsvpService.getUserRsvpForEvent(event.guid).pipe(mapTo(true));
          }),
          catchError(() => {
            return of(false);
          })
        );
      }),
      shareReplay()
    );
  }

  public register() {
    this.$event
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
    this.$event
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
    // this.checkinService.insertUserCheckin(this.eventGuid);
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
}
