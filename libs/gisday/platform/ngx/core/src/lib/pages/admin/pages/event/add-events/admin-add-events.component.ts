import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { EventService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Event } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';
import { FormToFormData } from '../../../../../../../../common/src/lib/utils/form-to-form-data';

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
      capacity: new FormControl(0),
      link: new FormControl('')
    })
  });
};

@Component({
  selector: 'tamu-gisc-admin-add-events',
  templateUrl: './admin-add-events.component.html',
  styleUrls: ['./admin-add-events.component.scss']
})
export class AdminAddEventsComponent extends BaseAdminAddComponent<Event> {
  constructor(private fb1: FormBuilder, private eventService: EventService) {
    super(fb1, eventService);

    this.form = formExporter();
  }

  public submitNewEntity() {
    // Wed Apr 06 2022 17:24:54 GMT-0500 (Central Daylight Time)
    // toDateString() Wed Apr 06 2022
    // toISOString() 2022-04-06T22:26:44.116Z
    // toUTCString() Wed, 06 Apr 2022 22:28:36 GMT
    // toTimeString() 17:29:25 GMT-0500 (Central Daylight Time)

    const data: FormData = FormToFormData(this.form);
    this.eventService.createEventFromFormData(data);
  }
}
