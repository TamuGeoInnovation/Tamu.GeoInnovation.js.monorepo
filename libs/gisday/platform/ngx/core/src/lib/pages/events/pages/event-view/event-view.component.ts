import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
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
    private ns: NotificationService
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      tags: [null],
      organizations: [null]
    });

    this.activeSeason$ = this.ss.activeSeason$.pipe(shareReplay());
    this.events$ = this.eventService.getEvents().pipe(shareReplay());
    this.tags$ = this.tagService.getEntities().pipe(shareReplay());
    this.organizations$ = this.os.getEntities().pipe(shareReplay());
    this.userInfo$ = this.us.getSignedOnEntity().pipe(shareReplay());
    this.userProfileComplete$ = this.userInfo$.pipe(
      map((user) => {
        return user?.app_metadata?.gisday?.completedProfile === true;
      }),
      shareReplay()
    );

    this.activeTagFilters$ = this.form.get('tags').valueChanges.pipe(shareReplay());
    this.activeOrgFilters$ = this.form.get('organizations').valueChanges.pipe(shareReplay());
    this.rsvps$ = this.rs.getRsvpsForSignedInUser().pipe(
      map((rsvps) => {
        return rsvps.map((rsvp) => {
          return rsvp?.event?.guid;
        });
      })
    );
  }

  public toggleFilters() {
    this._filtersVisible$.next(!this._filtersVisible$.value);
  }

  public registerEvent(eventGuid: string) {
    this.userProfileComplete$.subscribe((complete) => {
      if (complete) {
        this.rs.createRsvp(eventGuid).subscribe(() => {
          console.log(`Registered for event ${eventGuid}`);
        });
      } else {
        this.ns.toast({
          message: 'You must complete your profile before registering for events.',
          id: 'gisday-register-fail',
          title: 'Profile Incomplete'
        });
      }
    });
  }

  public unregisterEvent(eventGuid: string) {
    this.userProfileComplete$.subscribe((complete) => {
      if (complete) {
        this.rs.deleteEntity(eventGuid).subscribe(() => {
          console.log(`Unregistered for event ${eventGuid}`);
        });
      } else {
        this.rs.deleteEntity(eventGuid).subscribe(() => {
          console.log(`Unregistered for event ${eventGuid}`);
        });
      }
    });
  }
}
