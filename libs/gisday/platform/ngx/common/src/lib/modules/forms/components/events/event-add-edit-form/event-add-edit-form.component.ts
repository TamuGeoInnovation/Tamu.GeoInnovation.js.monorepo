import { Component, OnInit, inject, input, signal } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  EMPTY,
  Observable,
  combineLatest,
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
  JudgingService,
  LocationService,
  SeasonService,
  SpeakerService,
  SpeakerEditsService,
  SessionFilesService,
  sendEditLinksToast,
  sendSessionDetailsToast,
  sendSlidesRequestToast,
  sendJudgingToast,
  TagService,
  BroadcastService
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import {
  CHECK_IN_MINUTES_AFTER,
  CHECK_IN_MINUTES_BEFORE,
  JUDGED_COMPETITIONS,
  siteHas,
  siteListsPlace,
  slidesZipName
} from '@tamu-gisc/gisday/common';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { ActionMenuComponent, ActionMenuItem } from '@tamu-gisc/ui-kits/ngx/layout';
import { serverMessage } from '../../../../../utils/server-message';
import { SeasonsDayTileComponent } from '../../seasons/seasons-day-tile/seasons-day-tile.component';
import { NgClass, AsyncPipe } from '@angular/common';
import { DateTimePickerComponent } from '@tamu-gisc/ui-kits/ngx/forms/date-time-picker';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectListComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { PresenterCardComponent } from '../../../../people/components/presenter-card/presenter-card.component';
import { eventFormProblems } from '../../../../../utils/event-form-problems';
import { sortSpeakersByName } from '../../../../../utils/speakers';
import { CheckboxGroupComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

import { GISDAY_SITE } from '../../../../../site/site';
import { adminEntityForm } from '../../../admin-entity-form';
import {
  sendJudgingEmail,
  sendProfileEmail,
  sendSessionDetailsEmail,
  sendSlidesRequestEmail
} from '../../../../modals/review-email-modal/profile-email';
import { FilesSource, SubmissionFilesComponent } from '../../../../submission-files/submission-files.component';

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
    ActionMenuComponent,
    SubmissionFilesComponent,
    AsyncPipe
  ]
})
export class EventAddEditFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly at = inject(ActivatedRoute);
  /** Its save and delete, and what they say (#3340, #3382). */
  private readonly saves = adminEntityForm('Event', '/admin/events');
  private readonly seasonService = inject(SeasonService);
  private readonly speakerService = inject(SpeakerService);
  private readonly tagService = inject(TagService);
  private readonly eventLocationService = inject(LocationService);
  private readonly eventBroadcastService = inject(BroadcastService);
  private readonly eventService = inject(EventService);
  private readonly ns = inject(NotificationService);
  private readonly speakerEdits = inject(SpeakerEditsService);
  private readonly sessionFiles = inject(SessionFilesService);
  private readonly modals = inject(ModalService);
  private readonly site = inject(GISDAY_SITE);
  private readonly judging = inject(JudgingService);

  /** Whether the site runs the research competitions, which a session's judges score (#3183). */
  public readonly judgingOn = siteHas(this.site, 'competitions');

  /** The Judged competition choices (#3183): none, or one of the four. */
  public readonly judgedCompetitionDict: ReadonlyArray<{ name: string; value: string }> = [
    { name: 'None', value: '' },
    ...JUDGED_COMPETITIONS.map((row) => ({ name: row.label, value: row.competition }))
  ];

  /**
   * Whether the session's judges have been read (#3183). Until they have, a save leaves them as they are, rather than
   * clearing them with the empty list the form starts with.
   */
  private judgesLoaded = false;

  /**
   * What stops the event being saved, shown above the buttons after a save is tried (#1773).
   */
  public readonly problems = signal<Array<string>>([]);

  public readonly type = input<'create' | 'edit'>(undefined);

  /** The session's slides (#3093), uploaded by its speakers, for the admins to download. Set on an existing event. */
  public readonly slides = signal<FilesSource | null>(null);

  /** What the Speakers section's Email these speakers menu offers (#3092). */
  public readonly speakerEmails: ReadonlyArray<ActionMenuItem> = [
    { id: 'profile', label: 'Profile email' },
    { id: 'session-details', label: 'Session details' },
    // Each speaker's own link to upload their slides for this session (#3113).
    { id: 'slides-request', label: 'Ask for slides' },
    // Each judge's own judging link (#3183), to the session's judges only.
    { id: 'judging', label: 'Ask to judge' }
  ];

  /**
   * What the Email these speakers menu offers now: without Ask for slides while No slides is ticked (#3147), and with Ask
   * to judge only while a judged competition is chosen (#3183).
   */
  public speakerEmailItems(): ReadonlyArray<ActionMenuItem> {
    const noSlides = Boolean(this.form?.get('noSlides')?.value);
    const judged = Boolean(this.form?.get('judgedCompetition')?.value);

    return this.speakerEmails.filter(
      (item) => !(item.id === 'slides-request' && noSlides) && !(item.id === 'judging' && !judged)
    );
  }

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
      // Ticked, as the database column's default is, so a new event accepts RSVPs unless the organizer unticks it (#2706).
      isAcceptingRsvps: [true],
      isBringYourOwnDevice: [false],
      // The session's check-in window around its time (#3209), the database's defaults for a new session.
      checkInMinutesBefore: [CHECK_IN_MINUTES_BEFORE],
      checkInMinutesAfter: [CHECK_IN_MINUTES_AFTER],
      checkInAnyTime: [false],
      // A panel, a social, lunch (#3147): its speakers are not asked for slides.
      noSlides: [false],
      // Judging the research competitions (#3183): none chosen, open, and no judges.
      judgedCompetition: [''],
      judgingClosed: [false],
      judges: [[]],
      requirements: [null],
      broadcast: [null],
      location: [null],
      tags: [[]],
      speakers: [[]],
      season: [null]
    });

    this.tags$ = this.tagService.getEntitiesForActiveSeason().pipe(shareReplay(1));
    this.speakers$ = this.speakerService.getEntitiesForActiveSeason().pipe(shareReplay(1));
    const seasonBroadcasts$ = this.eventBroadcastService.getEntitiesForActiveSeason();
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
        // By last name, as they are added and removed (#2940).
        return sortSpeakersByName(speakerGuids.map((guid) => speakers.find((speaker) => speaker.guid === guid)));
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
          // By last name, as the API returns them in the order they were added (#2940).
          map((event) => sortSpeakersByName(event.speakers))
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
          broadcast: event?.broadcast?.guid,
          judgedCompetition: event?.judgedCompetition ?? ''
        });

        // Remove the season form control since we are editing an existing event
        // Will otherwise move to the active season
        this.form.removeControl('season');
      });

      // Its judges (#3183), from their own route: the public session page does not list them.
      if (this.judgingOn) {
        this.entity$
          .pipe(
            take(1),
            filter((event) => Boolean(event?.guid)),
            switchMap((event) => this.judging.eventJudging(event.guid))
          )
          .subscribe((judging) => {
            this.form.patchValue({ judges: judging?.judges ?? [] });
            this.judgesLoaded = true;
          });
      }

      this.selectedEventDateStart$ = this.entity$.pipe(take(1), this._timeStringFromEvent$('startTime'), shareReplay());

      this.selectedEventDateEnd$ = this.entity$.pipe(take(1), this._timeStringFromEvent$('endTime'), shareReplay());

      // The session's slides (#3093), from its speakers' edit links: listed here to download, and to remove (#3105).
      this.at.params
        .pipe(
          map((params) => params.guid as string),
          filter((guid) => guid !== undefined)
        )
        .subscribe((guid) =>
          this.slides.set({
            list: () => this.sessionFiles.forEvent(guid),
            download: (file) => this.sessionFiles.download(guid, file),
            // Every speaker's at once, a folder each, named for the session (#3174).
            downloadAll: () => this.sessionFiles.zip(guid),
            downloadAllName: () => slidesZipName(this.form.getRawValue().name),
            add: () => EMPTY,
            // Any speaker's, asked about on the page first (#3105).
            remove: (file) => this.sessionFiles.removeFromEvent(guid, file)
          })
        );
    } else {
      this.eventSpeakers$ = formSpeakerChanges;
      // A new session has no judges to keep.
      this.judgesLoaded = true;

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

    // The site's own organizations' broadcasts, those with no place yet, and the event's own, whoever's it is, so opening
    // an event never drops its broadcast (#3048). gisday.tamu.edu listed every organization's Zooms.
    const ownBroadcast$ = this.entity$
      ? this.entity$.pipe(
          take(1),
          map((event) => event?.broadcast?.guid ?? null)
        )
      : of(null);

    this.broadcasts$ = combineLatest([seasonBroadcasts$, ownBroadcast$]).pipe(
      map(([broadcasts, own]) => (broadcasts ?? []).filter((b) => b.guid === own || siteListsPlace(this.site, b.place))),
      shareReplay(1)
    );
  }

  /** The email chosen from the Email these speakers menu (#3092). */
  public emailSpeakers(choice: string) {
    if (choice === 'session-details') {
      this.emailSessionDetails();
    } else if (choice === 'slides-request') {
      this.emailSlidesRequest();
    } else if (choice === 'judging') {
      this.emailJudges();
    } else {
      this.emailSpeakersEditLinks();
    }
  }

  /**
   * Emails the session's saved speakers its details (#3092): when and where, the Zoom link and dial-in for a hybrid or
   * virtual session, check-in by its QR code, and what to bring, prefilled from the session as it is saved, then read and
   * edited first in the profile email's window.
   */
  public emailSessionDetails() {
    this.entity$
      .pipe(
        take(1),
        switchMap((event) =>
          sendSessionDetailsEmail(this.modals, this.speakerEdits.previewSessionDetails(event.guid), (email) =>
            this.speakerEdits.sendSessionDetails(event.guid, email)
          )
        )
      )
      .subscribe({
        next: (result) => this.ns.toast(sendSessionDetailsToast(result)),
        error: () =>
          this.ns.toast({ id: 'session-details-email', title: 'Session details not sent', message: 'Please try again.' })
      });
  }

  /**
   * Asks the session's saved speakers for their slides (#3113): the session's name, day, time and room, what they may
   * upload, and each speaker's own link to upload them, a copy each, read and edited first in the same window.
   */
  public emailSlidesRequest() {
    this.entity$
      .pipe(
        take(1),
        switchMap((event) =>
          sendSlidesRequestEmail(this.modals, this.speakerEdits.previewSlidesRequest(event.guid), (email) =>
            this.speakerEdits.sendSlidesRequest(event.guid, email)
          )
        )
      )
      .subscribe({
        next: (result) => this.ns.toast(sendSlidesRequestToast(result)),
        error: () =>
          this.ns.toast({ id: 'slides-request-email', title: 'Slides request not sent', message: 'Please try again.' })
      });
  }

  /**
   * Asks the session's saved judges to judge its competition (#3183): each their own judging link, a copy each, read and
   * edited first in the same window. Only the judges, never the session's other speakers.
   */
  public emailJudges() {
    this.entity$
      .pipe(
        take(1),
        switchMap((event) =>
          sendJudgingEmail(this.modals, this.speakerEdits.previewJudging(event.guid), (email) =>
            this.speakerEdits.sendJudging(event.guid, email)
          )
        )
      )
      .subscribe({
        next: (result) => this.ns.toast(sendJudgingToast(result)),
        error: (err) =>
          this.ns.toast({ id: 'judging-email', title: 'Judges not asked', message: serverMessage(err, 'Please try again.') })
      });
  }

  /**
   * Emails each of the event's saved speakers their own link to edit their profile (#2936): for the competition finalists'
   * session, everyone on it at once. Speakers added on this page but not yet saved are included; the link is for their
   * profile, not the event. The email is read and edited first (#3023).
   */
  public emailSpeakersEditLinks() {
    this.eventSpeakers$
      .pipe(
        take(1),
        map((speakers) => speakers.map((s) => s.guid)),
        switchMap((guids) =>
          sendProfileEmail(this.modals, this.speakerEdits.preview(guids), (email) => this.speakerEdits.send(guids, email))
        )
      )
      .subscribe({
        next: (result) => this.ns.toast(sendEditLinksToast(result)),
        error: () =>
          this.ns.toast({ id: 'speaker-edit-links', title: 'Profile emails not sent', message: 'Please try again.' })
      });
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

    // Changed by a click rather than typed, and still a change not yet saved (#2942).
    this.form.markAsDirty();
  }

  public setEventDate(day: Partial<SeasonDay>) {
    this.form.patchValue({
      day: day.guid
    });
    this.form.markAsDirty();
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

    this.form.markAsDirty();
  }

  public handleSubmission() {
    // An event needs its day, real times, a name, an abstract and its four choices before it is saved
    // (#1773). An incomplete one is not sent, and the form says what is missing.
    this.problems.set(eventFormProblems(this.form.getRawValue()));

    if (this.problems().length > 0) {
      this.ns.toast({
        id: 'event-incomplete',
        title: this.type() === 'create' ? 'Create Event' : 'Update Event',
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
    this.saves.save('delete', this.eventService.deleteEntity(this.form.getRawValue().guid));
  }

  /**
   * The form as it is saved: its judges only those among its speakers, and left out until they have been read, so the
   * save leaves them as they were (#3183).
   */
  public payload() {
    const { judges, ...value } = this.form.getRawValue();
    // A number box holds text; the columns are whole numbers (#3209). The form refuses anything else before saving.
    const rawValue = {
      ...value,
      checkInMinutesBefore: Number(value.checkInMinutesBefore),
      checkInMinutesAfter: Number(value.checkInMinutesAfter)
    };
    const speakers: Array<string> = rawValue.speakers ?? [];

    return this.judgesLoaded
      ? { ...rawValue, judges: ((judges ?? []) as Array<string>).filter((guid) => speakers.includes(guid)) }
      : rawValue;
  }

  private _updateEntity() {
    const rawValue = this.payload();

    this.saves.save('update', this.eventService.updateEntity(rawValue.guid, rawValue));
  }

  private _createEntity() {
    const rawValue = this.payload();

    this.saves.save('create', this.eventService.createEntity(rawValue));
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
