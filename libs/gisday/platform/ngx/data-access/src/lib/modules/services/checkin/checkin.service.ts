import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { LatLon } from '@tamu-gisc/common/utils/geometry';
import { CheckIn } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class CheckinService extends BaseService<CheckIn> {
  private http1 = inject(HttpClient);
  private ns = inject(NotificationService);

  public resource: string;

  constructor() {
    super('check-ins');
  }

  public getUserCheckins() {
    return this.http1.get<Array<Partial<CheckIn>>>(`${this.resource}/user`);
  }

  public getUserCheckinForEvent(eventGuid: string) {
    return this.http1.get<Partial<CheckIn>>(`${this.resource}/user/event/${eventGuid}`);
  }

  /**
   * @param location Where the attendee is. An in-person event needs it (#1766).
   */
  public insertUserCheckin(eventGuid: string, location?: LatLon) {
    return this.http1
      .post(`${this.resource}`, {
        eventGuid: eventGuid,
        latitude: location?.latitude,
        longitude: location?.longitude
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
            // A 403 already says what to do, such as being inside the check-in zone.
            message:
              err.status === 403
                ? err.error.message
                : `There was error checking-in for this event. ${err.error.message}`
          });

          throw new Error(`Failed to check-in`);
        })
      );
  }
}
