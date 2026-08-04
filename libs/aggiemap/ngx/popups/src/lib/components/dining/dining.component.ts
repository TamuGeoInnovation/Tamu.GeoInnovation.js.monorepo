import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { combineLatestWith, concatMap, map, Observable, of, reduce, shareReplay, withLatestFrom } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

@Component({
  selector: 'tamu-gisc-dining-popup-component',
  templateUrl: './dining.component.html',
  styleUrls: ['../base/base.popup.component.scss', './dining.component.scss']
})
export class DiningPopupComponent extends BaseDirectionsComponent implements OnInit {
  public menu: Observable<IDiningLocationMenu>;
  public schedule: Observable<ISimplifiedDiningLocationHours>;
  public statusText: Observable<IDeconstructedStatusText>;

  private _serviceUrl = 'https://api.aggiemap.tamu.edu/dining';
  private _todaysDateStamp: Observable<string>;

  constructor(
    private rtr: Router,
    private rt: ActivatedRoute,
    private ps: TripPlannerService,
    private anl: Angulartics2,
    private ms: EsriMapService,
    private readonly http: HttpClient
  ) {
    super(rtr, rt, ps, anl, ms);
  }

  public override ngOnInit() {
    super.ngOnInit();
    this._todaysDateStamp = of(new Date()).pipe(
      map((date) => {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${year}-${month}-${day}`;
      }),
      shareReplay(1)
    );

    this._fetchDiningDetails();
  }

  public override startDirections() {
    super.startDirections(`${this.data.attributes.name}`);
  }

  private _fetchDiningDetails() {
    this.menu = this.http.get<IDiningLocationMenu>(`${this._serviceUrl}/locations/${this.data.attributes.id}/menu`);

    this.schedule = this.http
      .get<IDiningLocationHours>(`${this._serviceUrl}/locations/${this.data.attributes.id}/schedule`)
      .pipe(
        concatMap((days) => Object.entries(days)),
        combineLatestWith(this._todaysDateStamp),
        reduce((acc, [[entryKey, entryValue], todayDatestamp]) => {
          // The first entry should always be today's date
          if (Object.keys(acc).length === 0 && entryKey === todayDatestamp) {
            acc[entryKey] = entryValue;
          }

          // From then on, add every sequential item until the accumulator has 7 days
          if (Object.keys(acc).length > 0 && Object.keys(acc).length <= 7) {
            acc[entryKey] = entryValue;
          }

          return acc;
        }, {} as IDiningLocationHours),
        concatMap((days) => Object.entries(days)),
        reduce((acc, [datestamp, info]) => {
          const formattedHours = info.hours.map((hour) => {
            const start = new Date(
              `${datestamp}T${hour.start_hour.toString().padStart(2, '0')}:${hour.start_minutes
                .toString()
                .padStart(2, '0')}:00`
            );
            const end = new Date(
              `${datestamp}T${hour.end_hour.toString().padStart(2, '0')}:${hour.end_minutes.toString().padStart(2, '0')}:00`
            );

            return {
              start,
              end
            };
          });

          acc[datestamp] = {
            hours: formattedHours
          };

          return acc;
        }, {} as ISimplifiedDiningLocationHours),
        shareReplay(1)
      );

    this.statusText = this.schedule.pipe(
      withLatestFrom(this._todaysDateStamp),
      map(([schedule, todayDatestamp]) => {
        const scheduleKeys = Object.keys(schedule);
        const today = schedule[todayDatestamp];
        const todayIndex = scheduleKeys.findIndex((key) => key === todayDatestamp);

        // If current day has no hours, location is closed.
        // If current day has hours and now > the last time block, location is closed.
        // If current day has hours and the end time of the last time block is 00:00 then location closes at midnight.
        // If either of these two conditions are true, find the next day with hours.
        const todayHasHours = today.hours.length > 0;
        const lastTimeBlock = today.hours[today.hours.length - 1];
        const lastTimeBBlockEndCarriesOverAndIsElapsed =
          lastTimeBlock?.end < lastTimeBlock?.start &&
          lastTimeBlock?.end.setDate(lastTimeBlock?.end.getDate() + 1) < Date.now();
        const todayHasHoursAndIsClosed = todayHasHours && lastTimeBlock?.end < new Date();

        if (
          todayHasHours === false ||
          todayHasHoursAndIsClosed === true ||
          lastTimeBBlockEndCarriesOverAndIsElapsed === true
        ) {
          const nextOpenDay = scheduleKeys.slice(todayIndex + 1).find((key) => {
            // todayIndex + 1 to skip today since we have already determined it is closed for the rest of the day
            const day = schedule[key];

            return day.hours.length > 0;
          });

          if (nextOpenDay === undefined) {
            return {
              status: 'Closed',
              statusCode: DINING_LOCATION_OPERATION_STATUS.CLOSED,
              message: ''
            } as IDeconstructedStatusText;
          }

          return {
            status: 'Closed',
            statusCode: DINING_LOCATION_OPERATION_STATUS.CLOSED,
            message: `Opens ${schedule[nextOpenDay].hours[0].start.toLocaleString('en-US', {
              weekday: 'long',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            })}` // date should be format EEEE hh:mm a
          } as IDeconstructedStatusText;
        }

        const now = new Date();

        // If today has hours, check if current time is within those hours
        // If it is, location is open. If not, then location is going to open later or is closed for the rest of the day
        const firstRelevantTimeBlock = today?.hours.find((timeBlock) => {
          const start = timeBlock.start;
          const end = timeBlock.end;

          // If current time is before the current time block's start, then the location has not opened yet
          // This should only ever return early if the condition is true for the first time block.
          if (now < start) {
            return true;
          }

          // If we get this far, then the current time block has an ending time of 00:00 or next day
          // If the current time is after the current time block's end, then the location is closed
          if (now > end && end < start) {
            return true;
          }

          // If we got this far, then we are not in the first time block. Check if the current time is after the last time block's end
          // If it is, then the location is closed
          if (now > end) {
            return true;
          }

          // If we got this far, then the current time is within the time block
          // Check if the current time is between the start and end of the time block

          return now >= start && now <= end;
        });

        if (!firstRelevantTimeBlock) {
          return {
            status: 'Closed',
            statusCode: DINING_LOCATION_OPERATION_STATUS.CLOSED,
            message: ''
          } as IDeconstructedStatusText;
        }

        let statusCode: DINING_LOCATION_OPERATION_STATUS;

        if (now > firstRelevantTimeBlock.start && now < firstRelevantTimeBlock.end) {
          statusCode = DINING_LOCATION_OPERATION_STATUS.OPEN;
        } else if (firstRelevantTimeBlock.end < firstRelevantTimeBlock.start) {
          statusCode = DINING_LOCATION_OPERATION_STATUS.OPEN_NEXT_DAY;
        } else {
          statusCode = DINING_LOCATION_OPERATION_STATUS.CLOSED;
        }

        let text: string;

        if (statusCode === DINING_LOCATION_OPERATION_STATUS.OPEN) {
          text = `Closes ${firstRelevantTimeBlock.end.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })}`;
        } else if (statusCode === DINING_LOCATION_OPERATION_STATUS.OPEN_NEXT_DAY) {
          // Add one day to the end time to get the next day's closing time
          const lateClosingDate = new Date(firstRelevantTimeBlock.end);
          lateClosingDate.setDate(lateClosingDate.getDate() + 1);

          text = `Closes ${lateClosingDate.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })}`;

          // Change status code to simple open to avoid having to deal with custom text and additional enums for this case.
          statusCode = DINING_LOCATION_OPERATION_STATUS.OPEN;
        } else {
          // If the location is closed, it's either too early or too late
          // The second case is already covered by the first condition above
          // So we the only remaining case is if the current time is before the first time block's start
          if (now < firstRelevantTimeBlock.start) {
            text = `Opens ${firstRelevantTimeBlock.start.toLocaleString('en-US', {
              weekday: 'long',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            })}`;
          } else {
            // Should never hit this case, but just in case
            console.warn('Location is closed but no implementation for this case.');
            text = '';
          }
        }

        return {
          status: statusCode,
          statusCode,
          message: text
        } as IDeconstructedStatusText;
      })
    );
  }
}

interface IDiningLocationInfo {
  location: {
    address: {
      city: string;
      coordinates: [number, number];
      state: string;
      street: string;
      zip_code: string;
    };
    building: {
      id: string;
      name: string;
    };
    id: string;
    name: string;
  };
  records: number;
  request_time: number;
  status: string;
}

interface IDiningLocationMenu {
  allergen_filter: boolean;
  closed: boolean;
  menu: {
    date: string;
    id: number;
    name: string;
    periods: Array<{
      categories: Array<{
        id: string;
        items: Array<{
          active: boolean | null;
          calcium: number | null;
          calories: number;
          cholesterol: number;
          desc: string;
          dietary_fiber: number;
          fat_calories: number;
          id: string;
          iron: number | null;
          name: string;
          nutrients: Array<{
            name: string;
            value: number | null;
          }>;
          portion: string;
          potassium: number | null;
          protein: number;
          qty: string;
          saturated_fat: number;
          sodium: number | null;
          sugars: number;
          total_carb: number;
          total_fat: number;
          trans_fat: number;
          vitamin_a: number | null;
          vitamin_c: number | null;
        }>;
        name: string;
        sort_order: number | null;
      }>;
      id: number;
      name: string;
      sort_order: number | null;
    }>;
  };
  records: number;
  request_time: number;
  status: string;
}

interface IDiningLocationHours {
  [datestamp: string]: {
    day: number;
    date: string;
    status: string;
    hours: Array<{
      start_hour: number;
      start_minutes: number;
      end_hour: number;
      end_minutes: number;
    }>;
    has_special_hours: boolean;
    closed: boolean;
  };
}

interface ISimplifiedDiningLocationHours {
  [datestamp: string]: {
    hours: Array<{
      start: Date;
      end: Date;
    }>;
  };
}

enum DINING_LOCATION_OPERATION_STATUS {
  OPEN = 'open',
  OPEN_NEXT_DAY = 'open-next-day',
  CLOSED = 'closed'
}

interface IDeconstructedStatusText {
  status: string;
  statusCode: DINING_LOCATION_OPERATION_STATUS;
  message: string;
}
