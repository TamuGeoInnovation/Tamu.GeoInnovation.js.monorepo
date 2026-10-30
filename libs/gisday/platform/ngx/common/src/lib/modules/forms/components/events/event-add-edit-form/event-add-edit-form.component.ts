import { Component, OnInit, inject, input, signal } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Observable,
  filter,
  from,
  map,
  merge,
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

import { DateTimePickerChange } from '@tamu-gisc/ui-kits/ngx/forms/date-time-picker';

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
import { SeasonsDayTileComponent } from '../../seasons/seasons-day-tile/seasons-day-tile.component';
import { NgClass, AsyncPipe } from '@angular/common';
import { DateTimePickerComponent } from '@tamu-gisc/ui-kits/ngx/forms/date-time-picker';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectListComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { PresenterCardComponent } from '../../../../people/components/presenter-card/presenter-card.component';
import { eventFormProblems } from '../../../../../utils/event-form-problems';
import { CheckboxGroupComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-event-add-edit-form',
  templateUrl: './event-add-edit-form.component.html',
  styleUrls: ['./event-add-edit-form.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SeasonsDayTileComponent,
    NgClass,
    DateTimePickerComponent,
    TextboxComponent,
    SelectComponent,
    CheckboxComponent,
    SelectListComponent,
    PresenterCardComponent,
    CheckboxGroupComponent,
    ButtonComponent,
    AsyncPipe
  ]
})
export class EventAddEditFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly at = inject(ActivatedRoute);
  private readonly rt = inject(Router);
  private readonly seasonService = inject(SeasonService);
  private readonly speakerService = inject(SpeakerService);
  private readonly tagService = inject(TagService);
  private readonly eventLocationService = inject(LocationService);
  private readonly eventBroadcastService = inject(BroadcastService);
  private readonly eventService = inject(EventService);
  private readonly ns = inject(NotificationService);

  /**
   * What stops the event being saved, shown above the buttons after a save is tried (#1773).
   */
  public readonly problems = signal<Array<string>>([]);

  public readonly type = input<'create' | 'edit'>(undefined);

  public form: UntypedFormGroup;

  public entity$: Observable<Partial<Event>>;
  public tags$: Observable<Array<Partial<Tag>>>;
  public speakers$: Observable<Array<Partial<Speaker>>>;
  public locations$: Observable<Array<Partial<EventLocation>>>;
  public broadcasts$: Observable<Array<Partial<EventBroadcast>>>;

  /**
   * Filtered list of speakers that are present in the event presenters list. This is effectively only the speakers
   * that are participating in the event.
   */
  public eventSpeakers$: Observable<Array<Partial<Speaker>>>;

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
      mode: [null],
      eventType: [null],
      presentationType: [null],
      isAcceptingRsvps: [false],
      isBringYourOwnDevice: [false],
      requirements: [null],
      broadcast: [null],
      location: [null],
      tags: [[]],
      speakers: [[]],
      season: [null]
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

    const formSpeakerChanges = (this.eventSpeakers$ = this.form.get('speakers').valueChanges.pipe(
      withLatestFrom(this.speakers$),
      map(([speakerGuids, speakers]) => {
        return speakerGuids.map((guid) => {
          return speakers.find((speaker) => speaker.guid === guid);
        });
      })
    ));

    if (this.type() === 'edit') {
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

      this.eventSpeakers$ = merge(
        formSpeakerChanges,
        this.entity$.pipe(
          map((event) => {
            return event.speakers;
          })
        )
      ).pipe(shareReplay(1));

      this.entity$.pipe(take(1)).subscribe((event) => {
        this.form.patchValue({
          ...event,
          // A stored time that cannot be read is cleared, so saving the event does not write it back (#1772).
          startTime: this._readableTime(event, 'startTime'),
          endTime: this._readableTime(event, 'endTime'),
          day: event?.day?.guid,
          tags: event?.tags?.map((tag) => tag.guid),
          speakers: event?.speakers?.map((speaker) => speaker.guid),
          location: event?.location?.guid,
          broadcast: event?.broadcast?.guid
        });

        // Remove the season form control since we are editing an existing event
        // Will otherwise move to the active season
        this.form.removeControl('season');
      });

      this.selectedEventDateStart$ = this.entity$.pipe(take(1), this._timeStringFromEvent$('startTime'), shareReplay());

      this.selectedEventDateEnd$ = this.entity$.pipe(take(1), this._timeStringFromEvent$('endTime'), shareReplay());
    } else {
      this.eventSpeakers$ = formSpeakerChanges;

      this.selectedEventDateStart$ = this._defaultTimeFromSelectedEvent$().pipe(
        this._applyTimeToForm('startTime'),
        shareReplay()
      );

      this.selectedEventDateEnd$ = this._defaultTimeFromSelectedEvent$().pipe(
        this._applyTimeToForm('endTime'),
        shareReplay()
      );

      this.seasonService.activeSeason$.pipe(take(1)).subscribe((season) => {
        this.form.patchValue({
          season: season.guid
        });
      });
    }
  }

  public patchSpeaker(speaker: Partial<Speaker>, operation?: 'add' | 'remove') {
    const currentSpeakers = this.form.getRawValue().speakers;
    let updatedSpeakers;

    if (operation) {
      if (operation === 'add') {
        updatedSpeakers = currentSpeakers.includes(speaker.guid) ? currentSpeakers : [...currentSpeakers, speaker.guid];
      } else {
        updatedSpeakers = currentSpeakers.filter((guid) => guid !== speaker.guid);
      }
    } else {
      if (currentSpeakers.includes(speaker.guid)) {
        updatedSpeakers = currentSpeakers.filter((guid) => guid !== speaker.guid);
      } else {
        updatedSpeakers = currentSpeakers.includes(speaker.guid) ? currentSpeakers : [...currentSpeakers, speaker.guid];
      }
    }

    this.form.patchValue({
      speakers: updatedSpeakers
    });
  }

  public setEventDate(day: Partial<SeasonDay>) {
    this.form.patchValue({
      day: day.guid
    });
  }

  public setEventTime(time: DateTimePickerChange<Date>, which: 'start' | 'end') {
    // A Date that is not valid would be stored as the text "Invalid Date", which made the event
    // impossible to open again and broke the Sessions page (#1772). Leave the stored time as it was.
    if (!(time?.value instanceof Date) || isNaN(time.value.getTime())) {
      return;
    }

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
    // An event needs its day, real times, a name, an abstract and its four choices before it is saved
    // (#1773). An incomplete one is not sent, and the form says what is missing.
    this.problems.set(eventFormProblems(this.form.getRawValue()));

    if (this.problems().length > 0) {
      this.ns.toast({
        id: 'event-incomplete',
        title: this.type() === 'create' ? 'Create event' : 'Update Event',
        message: 'The event was not saved. See what is missing above the buttons.'
      });

      return;
    }

    if (this.type() === 'create') {
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

        const parsed = new Date(`${dateStringFromEvent} ${timeStringFromEvent}`);

        // A missing or unreadable stored time opens on the default rather than as an invalid Date,
        // which left the whole event uneditable (#1772).
        if (dateStringFromEvent === null || !timeStringFromEvent || isNaN(parsed.getTime())) {
          return this._defaultTimeFromSelectedEvent$();
        } else {
          return of(parsed);
        }
      })
    );
  }

  /**
   * The event's stored time if it can be read, or null. "Invalid Date" was stored by #1772.
   */
  private _readableTime(event: Partial<Event>, timeProp: 'startTime' | 'endTime') {
    const time = event?.[timeProp];
    const day = event?.day?.date ? new Date(event.day.date).toDateString() : new Date().toDateString();

    return time && !isNaN(new Date(`${day} ${time}`).getTime()) ? time : null;
  }
}
