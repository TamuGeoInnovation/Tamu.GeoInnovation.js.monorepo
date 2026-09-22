import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, combineLatestWith, concatMap, map, Observable, of, reduce, shareReplay } from 'rxjs';

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

  /**
   * Emits `null` when the schedule request fails. The weekly breakdown is the only part of the popup
   * that still depends on that endpoint, so a failure degrades the accordion rather than the popup.
   */
  public schedule: Observable<ISimplifiedDiningLocationHours | null>;

  /**
   * Open/closed state for the location, read straight off the layer feature.
   *
   * The dining service already resolves this server-side and publishes `label` and a pre-composed
   * `message` on every feature, so the popup neither recomputes it nor waits on a request. This also
   * keeps the badge consistent with the map pin, which is rendered from the same `label` field.
   */
  public status: IDeconstructedStatusText;

  /** Distinguishes "the schedule request failed" from "it hasn't come back yet" in the accordion. */
  public scheduleUnavailable = false;

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

  public ngOnInit() {
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

    this.status = this._deriveStatus();

    this._fetchDiningDetails();
  }

  public startDirections() {
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
        catchError(() => {
          // The schedule endpoint is a separate upstream call from the layer itself and fails
          // independently of it. Degrade the accordion rather than letting the error tear down the
          // surrounding popup section.
          this.scheduleUnavailable = true;

          return of(null);
        }),
        shareReplay(1)
      );
  }

  /**
   * Builds the status badge from the layer feature attributes.
   *
   * `message` arrives pre-composed as `"<state>. <detail>"` — e.g. `"Closed. Opens tomorrow at 7:30am."` — so the
   * leading state is dropped in favour of `label`, which the map pin renderer also keys on, and the remainder becomes
   * the detail line.
   */
  private _deriveStatus(): IDeconstructedStatusText {
    const attributes = this.data.attributes;
    const isOpen = `${attributes?.label ?? ''}`.toLowerCase() === 'open';
    const message = `${attributes?.message ?? ''}`.trim();
    const detailIndex = message.indexOf('. ');

    return {
      status: isOpen ? 'Open' : 'Closed',
      statusCode: isOpen ? DINING_LOCATION_OPERATION_STATUS.OPEN : DINING_LOCATION_OPERATION_STATUS.CLOSED,
      message: detailIndex > -1 ? message.slice(detailIndex + 2) : null
    };
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
  CLOSED = 'closed'
}

interface IDeconstructedStatusText {
  status: string;
  statusCode: DINING_LOCATION_OPERATION_STATUS;
  /** `null` when the service publishes a bare state with no trailing detail, e.g. just "Closed." */
  message: string | null;
}
