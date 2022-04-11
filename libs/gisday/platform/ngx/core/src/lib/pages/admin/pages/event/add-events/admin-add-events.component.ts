import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { EventService, SpeakerService, TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Event, Speaker, Tag } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';
import { Observable, shareReplay } from 'rxjs';

export const formExporter = () => {
  return new FormGroup({
    guid: new FormControl(''),
    name: new FormControl(''),
    abstract: new FormControl(''),
    startTime: new FormControl(new Date()),
    endTime: new FormControl(new Date()),
    observedAttendeeStart: new FormControl(''),
    observedAttendeeEnd: new FormControl(''),
    googleDriveUrl: new FormControl(''),
    requiresRsvp: new FormControl(false),
    qrCode: new FormControl(''),
    type: new FormControl(''),
    presentationType: new FormControl(''),
    isAcceptingRsvps: new FormControl(false),
    isBringYourOwnDevice: new FormControl(false),
    requirements: new FormControl(''),
    broadcast: new FormGroup({
      presenterUrl: new FormControl(''),
      password: new FormControl(''),
      phoneNumber: new FormControl(''),
      meetingId: new FormControl(''),
      publicUrl: new FormControl('')
    }),
    location: new FormGroup({
      room: new FormControl(''),
      building: new FormControl(''),
      capacity: new FormControl(''),
      link: new FormControl('')
    }),
    tagsGroup$: new FormGroup({}),
    speakersGroup$: new FormGroup({})
  });
};

@Component({
  selector: 'tamu-gisc-admin-add-events',
  templateUrl: './admin-add-events.component.html',
  styleUrls: ['./admin-add-events.component.scss']
})
export class AdminAddEventsComponent extends BaseAdminAddComponent<Event> {
  public $tags: Observable<Array<Partial<Tag>>>;
  public $speakers: Observable<Array<Partial<Speaker>>>;

  constructor(
    private fb1: FormBuilder,
    private eventService: EventService,
    private speakerService: SpeakerService,
    private tagService: TagService
  ) {
    super(fb1, eventService);

    this.form = formExporter();

    this.$tags = this.tagService.getEntities().pipe(shareReplay(1));
    this.$speakers = this.speakerService.getEntities().pipe(shareReplay(1));

    this.$tags.subscribe((tags: Partial<Array<Tag>>) => {
      const tagsGroup: FormGroup = new FormGroup({});
      tags.forEach((tag) => {
        tagsGroup.addControl(tag.guid, new FormControl(''));
      });

      this.form.controls.tagsGroup$ = tagsGroup;
    });

    this.$speakers.subscribe((speakers: Partial<Array<Speaker>>) => {
      const speakersGroup: FormGroup = new FormGroup({});
      speakers.forEach((speaker) => {
        speakersGroup.addControl(speaker.guid, new FormControl(''));
      });

      this.form.controls.speakersGroup$ = speakersGroup;
    });
  }

  public submitNewEntity() {
    // Wed Apr 06 2022 17:24:54 GMT-0500 (Central Daylight Time)
    // toDateString() Wed Apr 06 2022
    // toISOString() 2022-04-06T22:26:44.116Z
    // toUTCString() Wed, 06 Apr 2022 22:28:36 GMT
    // toTimeString() 17:29:25 GMT-0500 (Central Daylight Time)

    const tags = this.form.controls.tagsGroup$.value;
    const speakers = this.form.controls.speakersGroup$.value;

    const checkedTags = Object.keys(tags).filter((key) => tags[key]);
    const checkedSpeakers = Object.keys(speakers).filter((key) => speakers[key]);

    this.form.addControl('tags', new FormControl(checkedTags));
    this.form.addControl('speakers', new FormControl(checkedSpeakers));

    this.eventService.createEntity(this.form.value).subscribe((result) => {
      console.log(result);
    });
  }
}
