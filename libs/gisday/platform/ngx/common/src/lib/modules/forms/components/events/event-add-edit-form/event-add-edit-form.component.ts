import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, shareReplay } from 'rxjs';

import { Event, Speaker, Tag } from '@tamu-gisc/gisday/platform/data-api';
import { EventService, SpeakerService, TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';

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

  constructor(
    private readonly fb: FormBuilder,
    private eventService: EventService,
    private speakerService: SpeakerService,
    private tagService: TagService
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      guid: [''],
      name: [''],
      abstract: [''],
      startTime: [new Date()],
      endTime: [new Date()],
      observedAttendeeStart: [''],
      observedAttendeeEnd: [''],
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
  }

  public submitNewEntity() {
    const form = this.form.getRawValue();

    this.eventService.createEntity(form).subscribe((result) => {
      console.log(result);
    });
  }
}

