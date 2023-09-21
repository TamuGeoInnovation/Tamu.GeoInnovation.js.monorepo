import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, map, mergeMap, shareReplay, toArray, withLatestFrom } from 'rxjs';

import { Event, SeasonDay, Speaker, Tag } from '@tamu-gisc/gisday/platform/data-api';
import { EventService, SeasonService, SpeakerService, TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { DlDateTimePickerChange } from 'angular-bootstrap-datetimepicker';

@Component({
  selector: 'tamu-gisc-event-add-edit-form',
  templateUrl: './event-add-edit-form.component.html',
  styleUrls: ['./event-add-edit-form.component.scss']
})
export class EventAddEditFormComponent implements OnInit {
  @Input()
  public type: 'create' | 'edit';

  public entity$: Observable<Partial<Event>>;
  public form: FormGroup;

  public tags$: Observable<Array<Partial<Tag>>>;
  public speakers$: Observable<Array<Partial<Speaker>>>;

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

  constructor(
    private readonly fb: FormBuilder,
    private readonly eventService: EventService,
    private readonly speakerService: SpeakerService,
    private readonly tagService: TagService,
    private readonly seasonService: SeasonService
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      guid: [''],
      name: [''],
      abstract: [''],
      eventDate: [''],
      startTime: [''],
      endTime: [''],
      observedAttendeeStart: [0],
      observedAttendeeEnd: [0],
      googleDriveUrl: [''],
      requiresRsvp: [false],
      qrCode: [''],
      type: [''],
      presentationType: [''],
      isAcceptingRsvps: [false],
      isBringYourOwnDevice: [false],
      requirements: [''],
      broadcast: this.fb.group({
        presenterUrl: [''],
        password: [''],
        phoneNumber: [''],
        meetingId: [''],
        publicUrl: ['']
      }),
      location: this.fb.group({
        room: [''],
        building: [''],
        capacity: [''],
        link: ['']
      }),
      tags: [[]],
      speakers: [[]]
    });

    this.tags$ = this.tagService.getEntities().pipe(shareReplay(1));
    this.speakers$ = this.speakerService.getEntities().pipe(shareReplay(1));

    this.activeSeasonDays$ = this.seasonService.activeSeason$.pipe(
      mergeMap((season) => {
        return season.days;
      }),
      map((day) => {
        return {
          guid: day.guid,
          date: new Date(day.date)
        };
      }),
      toArray()
    );

    this.selectedEventDate$ = this.form.valueChanges.pipe(
      map((form) => {
        return form.eventDate;
      }),
      shareReplay()
    );

    this.selectedEventDateStart$ = this.form.valueChanges.pipe(
      map((form) => {
        return form.eventDate;
      }),
      withLatestFrom(this.activeSeasonDays$),
      map(([eventDateGuid, days]) => {
        return days.find((day) => day.guid === eventDateGuid).date;
      }),
      shareReplay()
    );
  }

  public submitNewEntity() {
    const form = this.form.getRawValue();

    this.eventService.createEntity(form).subscribe((result) => {
      console.log(result);
    });
  }

  public setEventDate(day: Partial<SeasonDay>) {
    this.form.patchValue({
      eventDate: day.guid
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
}

