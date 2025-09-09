import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, Subject, combineLatest, forkJoin, merge } from 'rxjs';
import { filter, map, shareReplay, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
import { SettingsService } from '@tamu-gisc/common/ngx/settings';

@Component({
  selector: 'tamu-gisc-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.scss']
})
export class EventViewComponent implements OnInit, OnDestroy {
  public activeSeason$: Observable<ActiveSeasonDto>;
  public events$: Observable<Array<Partial<Event>>>;
  public tags$: Observable<Array<Partial<Tag>>>;
  public organizations$: Observable<Array<Partial<Place>>>;
  public userInfo$: Observable<Partial<GisDayAppMetadata>>;
  public isAuthed$: Observable<boolean>;
  public userProfileComplete$: Observable<boolean>;

  public activeTagFilters$: Observable<Array<string>>;
  public activeOrgFilters$: Observable<Array<string>>;
  public activeFilterCount$: Observable<number>;
  public rsvps$: Observable<Array<string>>;

  private _filtersVisible$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public filtersVisible$: Observable<boolean> = this._filtersVisible$.asObservable();
  private _destroy$: Subject<boolean> = new Subject();

  /**
   * Form group used to delate filter changes as observables that can
   * be passed into the day cards to filter events.
   */
  public form: UntypedFormGroup;

  constructor(
    private readonly eventService: EventService,
    private readonly tagService: TagService,
    private readonly ss: SeasonService,
    private readonly os: PlaceService,
    private readonly fb: UntypedFormBuilder,
    private readonly rs: RsvpService,
    private readonly us: UserService,
    private readonly ns: NotificationService,
    private readonly st: SettingsService,
    private readonly as: AuthService,
    private readonly at: ActivatedRoute,
    private readonly rt: Router
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      tags: [null],
      organizations: [null]
    });

    const settings = this.st
      .init({
        storage: {
          subKey: 'event-filters'
        },
        settings: {
          tags: {
            value: '',
            persistent: true
          },
          organizations: {
            value: '',
            persistent: true
          }
        }
      })
      .pipe(shareReplay());

    this.tags$ = this.tagService.getEntitiesForActiveSeason().pipe(shareReplay(1));
    this.organizations$ = this.os.getEntitiesForActiveSeason().pipe(shareReplay(1));

    // Subscription needs to remain active for the lifetime of the component, otherwise
    // the settings will not be written to localStorage when `updateSettings` is called.
    //
    // Great design...
    //
    settings.pipe(takeUntil(this._destroy$)).subscribe((settings) => {
      console.log('Set new filters', settings);

      this.rt.navigate([], {
        relativeTo: this.at,
        queryParams: {
          tags: settings.tags ? settings.tags.toString() : null,
          orgs: settings.organizations ? settings.organizations.toString() : null
        },
        queryParamsHandling: 'merge'
      });
    });

    // Shorthand for getting the initial settings state value and using as seed value for
    // form and filters.
    const singularSettings = forkJoin([settings.pipe(take(1)), this.at.queryParams.pipe(take(1))]).pipe(
      map(([settings, params]) => {
        // If either tags or orgs are present in the query params, use them, including overriding one or the other of the missing query params.
        // When entering the page with query params, the query params represent an absolute state and as such no settings should be used, even if they exist.
        if (params.tags || params.orgs) {
          return {
            tags: params.tags ? params.tags : '',
            organizations: params.orgs ? params.orgs : ''
          };
        } else {
          return settings;
        }
      }),
      shareReplay(1)
    );

    // Initial form patch so that the filters get passed down to the day cards
    // In the case that the user has already set filters and there was a change to the orgs or tags which results in a guid no longer existing,
    // since we use an exclusive filter, we need to ensure that the filters are valid otherwise it's possible that no events will be displayed.
    // Logic is simple: Get filters from local storage, and then compare against current tags and orgs and filter
    singularSettings
      .pipe(
        switchMap((settings) => {
          return forkJoin([this.tags$, this.organizations$]).pipe(map(([tags, orgs]) => ({ settings, tags, orgs })));
        })
      )
      .subscribe((combined) => {
        const splitTags = combined.settings.tags ? (combined.settings.tags as string).split(',') : [];
        const splitOrgs = combined.settings.organizations ? (combined.settings.organizations as string).split(',') : [];

        const onlyValidTags = splitTags.filter((tag) => {
          return combined.tags.some((t) => {
            return t.guid === tag;
          });
        });

        const onlyValidOrgs = splitOrgs.filter((org) => {
          return combined.orgs.some((o) => {
            return o.guid === org;
          });
        });

        this.form.patchValue({
          tags: onlyValidTags,
          organizations: onlyValidOrgs
        });
      });

    this.isAuthed$ = this.as.isAuthenticated$;
    this.activeSeason$ = this.ss.activeSeason$.pipe(shareReplay());
    this.userInfo$ = this.isAuthed$.pipe(
      filter((auth) => {
        return auth === true;
      }),
      switchMap(() => {
        return this.as.user$;
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

    this.activeTagFilters$ = merge(
      this.form.get('tags').valueChanges.pipe(
        tap((tags) => {
          this.st.updateSettings({
            tags: tags ? tags.toString() : null
          });
        })
      ),
      singularSettings.pipe(
        map((settings) => {
          return settings.tags ? (settings.tags as string).split(',') : null;
        })
      ) // The second observable behaves like startWith, because it only emits once. This is to ensure
      // that the initial filters are set and not rely on the user to change the filters to apply them.
    ).pipe(shareReplay());

    this.activeOrgFilters$ = merge(
      this.form.get('organizations').valueChanges.pipe(
        tap((orgs) => {
          this.st.updateSettings({
            organizations: orgs ? orgs.toString() : null
          });
        })
      ),
      singularSettings.pipe(
        map((settings) => {
          return settings.organizations ? (settings.organizations as string).split(',') : null;
        })
      ) // The second observable behaves like startWith, because it only emits once. This is to ensure
      // that the initial filters are set and not rely on the user to change the filters to apply them.
    ).pipe(shareReplay());

    this.activeFilterCount$ = combineLatest([this.activeTagFilters$, this.activeOrgFilters$]).pipe(
      map(([tags, orgs]) => {
        return (tags ? tags.length : 0) + (orgs ? orgs.length : 0);
      }),
      shareReplay()
    );

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

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
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
