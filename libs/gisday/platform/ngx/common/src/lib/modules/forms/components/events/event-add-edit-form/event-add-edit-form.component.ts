import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, filter, map, mergeMap, shareReplay, switchMap, take, tap, toArray, withLatestFrom } from 'rxjs';

import { DlDateTimePickerChange } from 'angular-bootstrap-datetimepicker';

import { Event, SeasonDay, Speaker, Tag } from '@tamu-gisc/gisday/platform/data-api';
import { EventService, SeasonService, SpeakerService, TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor(
    private readonly fb: FormBuilder,
    private readonly at: ActivatedRoute,
    private readonly rt: Router,
    private readonly eventService: EventService,
    private readonly speakerService: SpeakerService,
    private readonly tagService: TagService,
    private readonly seasonService: SeasonService
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
      googleDriveUrl: [null],
      requiresRsvp: [false],
      qrCode: [null],
      type: [null],
      presentationType: [null],
      isAcceptingRsvps: [false],
      isBringYourOwnDevice: [false],
      requirements: [null],
      // broadcast: this.fb.group({
      //   presenterUrl: [null],
      //   password: [null],
      //   phoneNumber: [null],
      //   meetingId: [null],
      //   publicUrl: [null]
      // }),
      // location: this.fb.group({
      //   room: [null],
      //   building: [null],
      //   capacity: [null],
      //   link: [null]
      // }),
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

      this.entity$.pipe(take(1)).subscribe((season) => {
        this.form.patchValue({
          ...season,
          day: season?.day?.guid,
          tags: season?.tags?.map((tag) => tag.guid),
          speakers: season?.speakers?.map((speaker) => speaker.guid)
        });
      });

      this.selectedEventDateStart$ = this.entity$.pipe(
        take(1),
        map((event) => {
          const dateStringFromEvent = new Date(event?.day?.date).toDateString();
          const timeStringFromEvent = event?.startTime;

          return new Date(`${dateStringFromEvent} ${timeStringFromEvent}`);
        }),
        shareReplay()
      );

      this.selectedEventDateEnd$ = this.entity$.pipe(
        take(1),
        map((event) => {
          const dateStringFromEvent = new Date(event?.day?.date).toDateString();
          const timeStringFromEvent = event?.endTime;

          return new Date(`${dateStringFromEvent} ${timeStringFromEvent}`);
        }),
        shareReplay()
      );
    } else {
      this.selectedEventDateStart$ = this.selectedEventDate$.pipe(
        take(1),
        withLatestFrom(this.activeSeasonDays$),
        map(([dayGuid, days]) => {
          return days.find((day) => day.guid === dayGuid).date;
        }),
        tap((date) => {
          this.form.patchValue({
            startTime: date.toTimeString()
          });
        }),
        shareReplay()
      );

      this.selectedEventDateEnd$ = this.selectedEventDate$.pipe(
        take(1),
        withLatestFrom(this.activeSeasonDays$),
        map(([dayGuid, days]) => {
          return days.find((day) => day.guid === dayGuid).date;
        }),
        tap((date) => {
          this.form.patchValue({
            endTime: date.toTimeString()
          });
        }),
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
    this.eventService.deleteEntity(this.form.getRawValue().guid).subscribe(() => {
      this._navigateBack();
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();

    this.eventService.updateEntity(rawValue.guid, rawValue).subscribe(() => {
      this._navigateBack();
    });
  }

  private _createEntity() {
    const rawValue = this.form.getRawValue();

    this.eventService.createEntity(rawValue).subscribe(() => {
      this._navigateBack();
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/events']);
  }
}

