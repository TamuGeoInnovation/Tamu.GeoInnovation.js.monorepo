import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-dining-popup-component',
  templateUrl: './dining.component.html',
  styleUrls: ['../base/base.popup.component.scss']
})
export class DiningPopupComponent extends BaseDirectionsComponent implements OnInit {
  public details: Observable<IDiningLocationInfo>;
  public menu: Observable<IDiningLocationMenu>;

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
    this.fetchDiningDetails();
  }

  public startDirections() {
    super.startDirections(`${this.data.attributes.name}`);
  }

  private fetchDiningDetails() {
    this.details = this.http.get<IDiningLocationInfo>(`${this._serviceUrl}/locations/${this.data.attributes.id}`);
    this.menu = this.http.get<IDiningLocationMenu>(`${this._serviceUrl}/locations/menu/${this.data.attributes.id}`);
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
