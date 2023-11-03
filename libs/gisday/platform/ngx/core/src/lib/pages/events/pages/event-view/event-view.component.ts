import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { ActiveSeasonDto, Event, Place, Tag } from '@tamu-gisc/gisday/platform/data-api';
import { EventService, PlaceService, SeasonService, TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { FormBuilder, FormGroup } from '@angular/forms';

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

  public activeTagFilters$: Observable<Array<string>>;
  public activeOrgFilters$: Observable<Array<string>>;

  private _filtersVisible$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public filtersVisible$: Observable<boolean> = this._filtersVisible$.asObservable();

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
    private readonly fb: FormBuilder
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

    this.activeTagFilters$ = this.form.get('tags').valueChanges.pipe(shareReplay());
    this.activeOrgFilters$ = this.form.get('organizations').valueChanges.pipe(shareReplay());
  }

  public toggleFilters() {
    this._filtersVisible$.next(!this._filtersVisible$.value);
  }
}
