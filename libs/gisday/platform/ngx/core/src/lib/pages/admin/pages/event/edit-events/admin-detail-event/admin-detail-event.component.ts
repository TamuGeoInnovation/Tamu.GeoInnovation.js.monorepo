import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { debounceTime, forkJoin, map, Observable, share, shareReplay, skip, Subject, switchMap, tap, zip } from 'rxjs';

import { EventService, SpeakerService, TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Event, Speaker, Tag } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formExporter } from '../../add-events/admin-add-events.component';

@Component({
  selector: 'tamu-gisc-admin-detail-event',
  templateUrl: './admin-detail-event.component.html',
  styleUrls: ['./admin-detail-event.component.scss']
})
export class AdminDetailEventComponent extends BaseAdminDetailComponent<Event> implements OnInit {
  public $tags: Observable<Array<Partial<Tag>>>;
  public $speakers: Observable<Array<Partial<Speaker>>>;

  public $zip;

  constructor(
    private fb1: FormBuilder,
    private route1: ActivatedRoute,
    private eventService: EventService,
    private speakerService: SpeakerService,
    private tagService: TagService
  ) {
    super(fb1, route1, eventService);
    this.form = formExporter();
  }

  public ngOnInit() {
    super.ngOnInit();

    this.$tags = zip([this.entity, this.tagService.getEntities()]).pipe(
      map(([event, tags]) => {
        // create a string that contains a comma delimited list of tag guids that are related to this event
        const guids = event.tags.map((tag) => tag.guid).toString();
        // return an array of tags with the inEvent property set
        return tags.map((tag) => {
          tag.inEvent = guids.includes(tag.guid);
          return tag;
        });
      }),
      map((tags) => {
        // Get the tags from the data-api and setup the child FormGroup tagsGroup$
        const tagGroup: FormGroup = new FormGroup({});
        tags.forEach((tag) => {
          tagGroup.addControl(tag.guid, new FormControl(tag.inEvent));
        });

        // Set value of tagsGroup$ to the newly created tagsGroup
        this.form.controls.tagsGroup$ = tagGroup;

        return tags;
      }),
      shareReplay(1)
    );

    this.$speakers = zip([this.entity, this.speakerService.getEntities()]).pipe(
      map(([event, speakers]) => {
        // create a string that contains a comma delimited list of speaker guids that are related to this event
        const guids = event.speakers.map((speaker) => speaker.guid).toString();
        // return an array of speakers with the inEvent property set
        return speakers.map((speaker) => {
          speaker.inEvent = guids.includes(speaker.guid);
          return speaker;
        });
      }),
      map((speakers) => {
        // Get the speakers from the data-api and setup the child FormGroup speakersGroup$
        const speakerGroup: FormGroup = new FormGroup({});
        speakers.forEach((speaker) => {
          speakerGroup.addControl(speaker.guid, new FormControl(speaker.inEvent));
        });

        // Set value of tagsGroup$ to the newly created tagsGroup
        this.form.controls.speakersGroup$ = speakerGroup;

        return speakers;
      }),
      shareReplay(1)
    );
  }

  public updateEntity() {
    const tags = this.form.controls.tagsGroup$.value;
    const speakers = this.form.controls.speakersGroup$.value;

    // Get those values that are true (checked) from the formGroups (tagsGroup$ / speakersGroup$)
    const checkedTags = Object.keys(tags).filter((key) => tags[key]);
    const checkedSpeakers = Object.keys(speakers).filter((key) => speakers[key]);

    // Clear already selected tags / speakers so we don't end up with duplicates
    (this.form.controls.tags as FormArray).clear({
      emitEvent: false
    });
    (this.form.controls.speakers as FormArray).clear({
      emitEvent: false
    });

    // Add the selected tags / speakers to the correct properties of the form
    checkedTags.forEach((tag) => {
      (this.form.controls.tags as FormArray).push(new FormControl(tag));
    });
    checkedSpeakers.forEach((speaker) => {
      (this.form.controls.speakers as FormArray).push(new FormControl(speaker));
    });

    // Update entity
    this.eventService.updateEntity(this.form.getRawValue()).subscribe((result) => {
      console.log('Update entity', result);
    });
  }
}
