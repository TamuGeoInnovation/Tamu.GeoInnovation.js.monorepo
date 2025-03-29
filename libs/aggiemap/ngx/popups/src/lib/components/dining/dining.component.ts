import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { combineLatestWith, concatMap, map, Observable, of, reduce } from 'rxjs';

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
  public details: Observable<IDiningLocationInfo>;
  public menu: Observable<IDiningLocationMenu>;
  public schedule: Observable<ISimplifiedDiningLocationHours>;
  public statusText: Observable<IDeconstructedStatusText>;

  private _serviceUrl = 'https://c3d.aggiemap.tamu.edu/dining';

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
    this._fetchDiningDetails();
  }

  public startDirections() {
    super.startDirections(`${this.data.attributes.name}`);
  }

  private _fetchDiningDetails() {
    this.details = this.http.get<IDiningLocationInfo>(`${this._serviceUrl}/locations/${this.data.attributes.id}`);
    this.menu = this.http.get<IDiningLocationMenu>(`${this._serviceUrl}/locations/${this.data.attributes.id}/menu`);
    this.statusText = of(this.data?.attributes?.message).pipe(
      map((text) => {
        const [status, message] = text.split('.').map((text) => text.trim());
        const statusCode =
          status.toLowerCase() === 'open' ? DINING_LOCATION_OPERATION_STATUS.OPEN : DINING_LOCATION_OPERATION_STATUS.CLOSED;

        return {
          status,
          message,
          statusCode
        };
      })
    );

    this.schedule = this.http
      .get<IDiningLocationHours>(`${this._serviceUrl}/locations/${this.data.attributes.id}/schedule`)
      .pipe(
        concatMap((days) => Object.entries(days)),
        combineLatestWith(of(new Date().toISOString().split('T')[0])),
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
          const dateHasHours = info.hours.length > 0;
          // new Date('2025-04-01, 16:40:00').toLocaleString()

          const formattedHours = info.hours.map((hour) => {
            const start = new Date(`${datestamp}, ${hour.start_hour}:${hour.start_minutes}:00`);
            const end = new Date(`${datestamp}, ${hour.end_hour}:${hour.end_minutes}:00`);

            return {
              start,
              end
            };
          });

          acc[datestamp] = {
            hours: formattedHours
          };

          return acc;
        }, {} as ISimplifiedDiningLocationHours)
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
  CLOSED = 'closed'
}

interface IDeconstructedStatusText {
  status: string;
  statusCode: DINING_LOCATION_OPERATION_STATUS;
  message: string;
}
