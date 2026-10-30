import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

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

  /**
   * Checks in the attendee in `checkin.userGuid`, not the signed-in admin. The admin page's
   * Check-ins > Add creates its entity through this (#1767).
   */
  public override createEntity(checkin?: Partial<CheckIn> & { userGuid?: string; eventGuid?: string }) {
    return this.http1.post<Partial<CheckIn>>(`${this.resource}/admin`, checkin);
  }

  public getUserCheckins() {
    return this.http1.get<Array<Partial<CheckIn>>>(`${this.resource}/user`);
  }

  public getUserCheckinForEvent(eventGuid: string) {
    return this.http1.get<Partial<CheckIn>>(`${this.resource}/user/event/${eventGuid}`);
  }

  /**
   * The code in a hybrid or virtual session's check-in QR code, for an organizer (#2560).
   */
  public getCheckInCode(eventGuid: string) {
    return this.http1.get<{ code: string }>(`${this.resource}/code/${eventGuid}`);
  }

  /**
   * @param position Where the attendee is, and how accurately. An in-person event at a location
   * with a check-in zone needs it (#1766).
   * @param code The code from the session's QR code, which a hybrid or virtual session needs (#2560).
   *
   * A failure is passed on as the API sent it, with no message here: the page shows the API's
   * reason beside the button.
   */
  public insertUserCheckin(eventGuid: string, position?: LatLon & { accuracy?: number }, code?: string) {
    return this.http1
      .post(`${this.resource}`, {
        eventGuid: eventGuid,
        latitude: position?.latitude,
        longitude: position?.longitude,
        accuracy: position?.accuracy,
        code: code
      })
      .pipe(
        tap(() => {
          this.ns.toast({
            id: 'checkin-create-success',
            title: 'Event Check-In',
            message: `Successfully checked-in for this event.`
          });
        })
      );
  }
}
