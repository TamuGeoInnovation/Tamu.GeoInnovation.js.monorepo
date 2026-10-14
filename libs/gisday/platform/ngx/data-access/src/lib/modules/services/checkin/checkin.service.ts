import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { LatLon } from '@tamu-gisc/common/utils/geometry';
import { CheckInZoneRefusal } from '@tamu-gisc/gisday/common';
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
   * @param location Where the attendee is. An in-person event at a location with a check-in zone
   * needs it (#1766).
   * @param confirmOutsideZone The attendee chose to check in anyway from outside the zone, or
   * without a location. The check-in is flagged for organizers.
   *
   * A refusal for being outside the zone, or for giving no location, is passed on untouched, with no
   * message, so the caller can offer to check in anyway.
   */
  public insertUserCheckin(eventGuid: string, location?: LatLon, confirmOutsideZone?: boolean) {
    return this.http1
      .post(`${this.resource}`, {
        eventGuid: eventGuid,
        latitude: location?.latitude,
        longitude: location?.longitude,
        confirmOutsideZone: confirmOutsideZone === true
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
          if (isCheckInZoneRefusal(err)) {
            return throwError(() => err);
          }

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

/**
 * Whether a failed check-in was refused for being outside the check-in zone, or for giving no
 * location, which the attendee may override (#1766).
 */
export function isCheckInZoneRefusal(err: { status?: number; error?: { reason?: string } }): boolean {
  const reasons: Array<string> = Object.values(CheckInZoneRefusal);

  return err?.status === 403 && reasons.includes(err?.error?.reason);
}
