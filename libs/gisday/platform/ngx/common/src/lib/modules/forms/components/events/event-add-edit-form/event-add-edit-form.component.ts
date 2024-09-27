import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Observable,
  filter,
  from,
  map,
  mergeMap,
  of,
  pipe,
  shareReplay,
  switchMap,
  take,
  tap,
  toArray,
  withLatestFrom
} from 'rxjs';

import { DlDateTimePickerChange } from 'angular-bootstrap-datetimepicker';

import { Event, EventBroadcast, EventLocation, SeasonDay, Speaker, Tag } from '@tamu-gisc/gisday/platform/data-api';
import {
  EventService,
  LocationService,
  SeasonService,
  SpeakerService,
  TagService,
  BroadcastService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-event-add-edit-form',
  templateUrl: './event-add-edit-form.component.html',
  styleUrls: ['./event-add-edit-form.component.scss']
})
export class EventAddEditFormComponent implements OnInit {
  @Input()
  public type: 'create' | 'edit';

  public form: FormGroup;

  public entity$: Observable<Partial<Event>>;
  public tags$: Observable<Array<Partial<Tag>>>;
  public speakers$: Observable<Array<Partial<Speaker>>>;
  public locations$: Observable<Array<Partial<EventLocation>>>;
  public broadcasts$: Observable<Array<Partial<EventBroadcast>>>;

  /**
   * The days that are available for selection in the event date picker.
   *
   * This value is plucked straight from the active season.
   */
  public activeSeasonDays$: Observable<Array<Partial<SeasonDay>>>;

  /**
   * The guid of the selected event date. This is pulled from the form value changes
   * purely to reduce the need to make form getter calls in the template.
   */
  public selectedEventDate$: Observable<string>;

  /**
   *  The start time of the selected event date. This value is the intersection of the
   * eventDate value and active season days to yield the start time of the selected event date.
   */
  public selectedEventDateStart$: Observable<Date>;
  public selectedEventDateEnd$: Observable<Date>;

  public eventTypeDict = [
    {
      name: 'Open',
      value: 'open'
    },
    {
      name: 'University',
      value: 'university'
    },
    {
      name: 'Faculty',
      value: 'faculty'
    },
    {
      name: 'Student',
      value: 'student'
    },
    {
      name: 'High School',
      value: 'high-school'
    }
  ];

  public eventModeDict = [
    {
      name: 'In-Person',
      value: 'in-person'
    },
    {
      name: 'Virtual',
      value: 'virtual'
    },
    {
      name: 'Hybrid',
      value: 'hybrid'
    }
  ];

  public presentationTypeDict = [
    {
      name: 'Individual',
      value: 'individual'
    },
    {
      name: 'Group',
      value: 'group'
    }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly at: ActivatedRoute,
    private readonly rt: Router,
    private readonly seasonService: SeasonService,
    private readonly speakerService: SpeakerService,
    private readonly tagService: TagService,
    private readonly eventLocationService: LocationService,
    private readonly eventBroadcastService: BroadcastService,
    private readonly eventService: EventService,
    private readonly ns: NotificationService
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      guid: [null],
      name: [null],
      active: [true],
      abstract: [null],
      day: [null],
      startTime: [null],
      endTime: [null],
      observedAttendeeStart: [null],
      observedAttendeeEnd: [null],
      resources: [null],
      requiresRsvp: [false],
      qrCode: [null],
      mode: [null],
      eventType: [null],
      presentationType: [null],
      isAcceptingRsvps: [false],
      isBringYourOwnDevice: [false],
      requirements: [null],
      broadcast: [null],
      location: [null],
      tags: [[]],
      speakers: [[]]
    });

    this.tags$ = this.tagService.getEntitiesForActiveSeason().pipe(shareReplay(1));
    this.speakers$ = this.speakerService.getEntitiesForActiveSeason().pipe(shareReplay(1));
    this.broadcasts$ = this.eventBroadcastService.getEntitiesForActiveSeason().pipe(shareReplay(1));
    this.locations$ = this.eventLocationService.getEntitiesForActiveSeason().pipe(
      mergeMap((locations) => locations),
      map((loc) => {
        return {
          guid: loc.guid,
          building: loc.room ? `${loc.building} - ${loc.room}` : loc.building
        };
      }),
      toArray(),
      shareReplay(1)
    );

    this.activeSeasonDays$ = this.seasonService.activeSeason$.pipe(
      mergeMap((season) => {
        return from(season.days).pipe(
          map((day) => {
            return {
              guid: day.guid,
              date: new Date(day.date)
            };
          }),
          toArray()
        );
      })
    );

    this.selectedEventDate$ = this.form.valueChanges.pipe(
      map((form) => {
        return form.day;
      }),
      filter((dayGuid) => {
        return dayGuid !== null && dayGuid !== undefined;
      }),
      shareReplay()
    );

    if (this.type === 'edit') {
      this.entity$ = this.at.params.pipe(
        map((params) => {
          return params.guid;
        }),
        filter((guid) => {
          return guid !== undefined;
        }),
        switchMap((guid) => {
          return this.eventService.getEntity(guid);
        }),
        shareReplay()
      );

      this.entity$.pipe(take(1)).subscribe((event) => {
        this.form.patchValue({
          ...event,
          day: event?.day?.guid,
          tags: event?.tags?.map((tag) => tag.guid),
          speakers: event?.speakers?.map((speaker) => speaker.guid),
          location: event?.location?.guid,
          broadcast: event?.broadcast?.guid
        });
      });

      this.selectedEventDateStart$ = this.entity$.pipe(take(1), this._timeStringFromEvent$('startTime'), shareReplay());

      this.selectedEventDateEnd$ = this.entity$.pipe(take(1), this._timeStringFromEvent$('endTime'), shareReplay());
    } else {
      this.selectedEventDateStart$ = this._defaultTimeFromSelectedEvent$().pipe(
        this._applyTimeToForm('startTime'),
        shareReplay()
      );

      this.selectedEventDateEnd$ = this._defaultTimeFromSelectedEvent$().pipe(
        this._applyTimeToForm('endTime'),
        shareReplay()
      );
    }
  }

  public setEventDate(day: Partial<SeasonDay>) {
    this.form.patchValue({
      day: day.guid
    });
  }

  public setEventTime(time: DlDateTimePickerChange<Date>, which: 'start' | 'end') {
    // Get only the time portion of the date
    const timeString = time.value.toTimeString();

    if (which === 'start') {
      this.form.patchValue({
        startTime: timeString
      });
    }

    if (which === 'end') {
      this.form.patchValue({
        endTime: timeString
      });
    }
  }

  public handleSubmission() {
    if (this.type === 'create') {
      this._createEntity();
    } else {
      this._updateEntity();
    }
  }

  public deleteEntity() {
    this.eventService.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'event-delete-success',
          title: 'Delete event',
          message: `Event was successfully deleted.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'event-delete-failed',
          title: 'Delete event',
          message: `Error deleting event: ${err.status}`
        });
      }
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();

    this.eventService.updateEntity(rawValue.guid, rawValue).subscribe({
      next: () => {
        this.ns.toast({
          id: 'event-update-success',
          title: 'Update Event',
          message: `Event was successfully updated.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'event-update-failed',
          title: 'Update Event',
          message: `Error updating event: ${err.status}`
        });
      }
    });
  }

  private _createEntity() {
    const rawValue = this.form.getRawValue();

    this.eventService.createEntity(rawValue).subscribe({
      next: () => {
        this.ns.toast({
          id: 'event-create-success',
          title: 'Create event',
          message: `Event was successfully created.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'event-create-failed',
          title: 'Create event',
          message: `Error creating event: ${err.status}`
        });
      }
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/events']);
  }

  private _defaultTimeFromSelectedEvent$() {
    return this.selectedEventDate$.pipe(
      take(1),
      withLatestFrom(this.activeSeasonDays$),
      map(([dayGuid, days]) => {
        return days.find((day) => day.guid === dayGuid).date;
      })
    );
  }

  private _applyTimeToForm(formProp: 'startTime' | 'endTime') {
    return pipe(
      tap((date: Date) => {
        this.form.patchValue({
          [formProp]: date.toTimeString()
        });
      })
    );
  }

  private _timeStringFromEvent$(timeProp: 'startTime' | 'endTime') {
    return pipe(
      switchMap((event: Event) => {
        const dateStringFromEvent = event?.day !== null ? new Date(event?.day?.date).toDateString() : null;
        const timeStringFromEvent = event?.[timeProp];

        if (dateStringFromEvent === null || timeStringFromEvent === null || timeStringFromEvent === undefined) {
          return this._defaultTimeFromSelectedEvent$();
        } else {
          return of(new Date(`${dateStringFromEvent} ${timeStringFromEvent}`));
        }
      })
    );
  }
}
