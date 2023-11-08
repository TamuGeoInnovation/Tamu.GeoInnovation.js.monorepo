import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ActiveSeasonDto, Event, GisDayAppMetadata, Place, Tag } from '@tamu-gisc/gisday/platform/data-api';
import {
  EventService,
  PlaceService,
  RsvpService,
  SeasonService,
  TagService,
  UserService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { AuthService } from '@tamu-gisc/common/ngx/auth';

@Component({
  selector: 'tamu-gisc-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.scss']
})
export class EventViewComponent implements OnInit {
  public activeSeason$: Observable<ActiveSeasonDto>;
  public events$: Observable<Array<Partial<Event>>>;
  public tags$: Observable<Array<Partial<Tag>>>;
  public organizations$: Observable<Array<Partial<Place>>>;
  public userInfo$: Observable<Partial<GisDayAppMetadata>>;
  public isAuthed$: Observable<boolean>;
  public userProfileComplete$: Observable<boolean>;

  public activeTagFilters$: Observable<Array<string>>;
  public activeOrgFilters$: Observable<Array<string>>;
  public rsvps$: Observable<Array<string>>;

  private _filtersVisible$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public filtersVisible$: Observable<boolean> = this._filtersVisible$.asObservable();
  private _refresh$: Subject<boolean> = new Subject();

  /**
   * Form group used to delate filter changes as observables that can
   * be passed into the day cards to filter events.
   */
  public form: FormGroup;

  constructor(
    private readonly eventService: EventService,
    private readonly tagService: TagService,
    private readonly ss: SeasonService,
    private readonly os: PlaceService,
    private readonly fb: FormBuilder,
    private readonly rs: RsvpService,
    private readonly us: UserService,
    private ns: NotificationService,
    private readonly as: AuthService
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      tags: [null],
      organizations: [null]
    });

    this.isAuthed$ = this.as.isAuthenticated$;
    this.activeSeason$ = this.ss.activeSeason$.pipe(shareReplay());
    this.events$ = this.eventService.getEvents().pipe(shareReplay());
    this.tags$ = this.tagService.getEntities().pipe(shareReplay());
    this.organizations$ = this.os.getEntities().pipe(shareReplay());
    this.userInfo$ = this.isAuthed$.pipe(
      filter((auth) => {
        return auth === true;
      }),
      switchMap(() => {
        return this.us.getSignedOnEntity();
      }),
      shareReplay()
    );

    this.userProfileComplete$ = this.userInfo$.pipe(
      map((user) => {
        return user?.app_metadata?.gisday?.completedProfile === true;
      }),
      shareReplay()
    );

    this.activeTagFilters$ = this.form.get('tags').valueChanges.pipe(shareReplay());
    this.activeOrgFilters$ = this.form.get('organizations').valueChanges.pipe(shareReplay());
    this.rsvps$ = this.isAuthed$.pipe(
      filter((auth) => {
        return auth === true;
      }),
      switchMap(() => {
        return this.rs.getRsvpsForSignedInUser().pipe(
          map((rsvps) => {
            return rsvps.map((rsvp) => {
              return rsvp?.event?.guid;
            });
          })
        );
      }),
      shareReplay()
    );
  }

  public toggleFilters() {
    this._filtersVisible$.next(!this._filtersVisible$.value);
  }

  // this.userProfileComplete$
  public registerEvent(eventGuid: string) {
    this.isAuthed$
      .pipe(
        tap((auth) => {
          if (auth === false) {
            this._toastNotLoggedIn();
          }
        }),
        filter((auth) => {
          return auth === true;
        }),
        withLatestFrom(this.userProfileComplete$),
        switchMap(([, complete]) => {
          if (complete) {
            return this.rs.createRsvp(eventGuid);
          } else {
            this._toastProfileIncomplete();

            return EMPTY;
          }
        })
      )
      .subscribe(() => {
        console.log(`Registered for event ${eventGuid}`);
        this._toastEventRegistrationSuccess();
      });
  }

  public unregisterEvent(eventGuid: string) {
    this.isAuthed$
      .pipe(
        tap((auth) => {
          if (auth === false) {
            this._toastNotLoggedIn();
          }
        }),
        filter((auth) => {
          return auth === true;
        }),
        withLatestFrom(this.userProfileComplete$),
        switchMap(([, complete]) => {
          if (complete) {
            return this.rs.deleteEntity(eventGuid);
          } else {
            this._toastProfileIncomplete();

            return EMPTY;
          }
        })
      )
      .subscribe(() => {
        console.log(`Unregistered for event ${eventGuid}`);
        this._toastEventUnregistrationSuccess();
      });
  }

  private _toastNotLoggedIn() {
    this.ns.toast({
      message: 'You must be signed in to register for events.',
      id: 'gisday-register-fail',
      title: 'Not Signed In'
    });
  }

  private _toastProfileIncomplete() {
    this.ns.toast({
      message: 'You must complete your profile before registering for events.',
      id: 'gisday-register-fail',
      title: 'Profile Incomplete'
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
}
