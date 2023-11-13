import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { CheckIn } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class CheckinService extends BaseService<CheckIn> {
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient, private ns: NotificationService) {
    super(env1, http1, 'check-ins');
  }

  public getUserCheckins() {
    return this.http1.get<Array<Partial<CheckIn>>>(`${this.resource}/user`);
  }

  public getUserCheckinForEvent(eventGuid: string) {
    return this.http1.get<Partial<CheckIn>>(`${this.resource}/user/event/${eventGuid}`);
  }

  public insertUserCheckin(eventGuid: string) {
    return this.http1
      .post(`${this.resource}`, {
        eventGuid: eventGuid
      })
      .pipe(
        tap(() => {
          this.ns.toast({
            id: 'checkin-create-success',
            title: 'Event Check-In',
            message: `Successfully checked-in for this event.`
          });
        }),
        catchError((err) => {
          this.ns.toast({
            id: 'checkin-create-failure',
            title: 'Event Check-In',
            message: `There was error checking-in for this event. ${err.error.message}`
          });

          throw new Error(`Failed to check-in`);
        })
      );
  }
}
