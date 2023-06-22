import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import qs from 'qs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { CmsResponse } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private _resource: string;

  constructor(private readonly env: EnvironmentService, private readonly http: HttpClient) {
    const connections = this.env.value('Connections');

    this._resource = connections.cms_api + 'locations';
  }

  public getLocations(parent?: number) {
    const query = qs.stringify({
      filters: {
        catId: parent || 0,
        private: {
          $eq: false
        }
      }
    });

    return this.http.get<CmsResponse<LocationEntry>>(`${this._resource}?${query}`);
  }
}

export interface LocationEntry {
  mrkId: number;
  author: string;
  weight: number;
  edited: string;
  name: string;
  private: boolean;
  changed: Date;
  description: string;
  feed_description: string;
  keywords: string;
  labels: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  marker_feed: any;
  popup: string;
  popup_url: string;
  reference: string;
  custom_data: string;
  shape: LocationShape;
  schedule: string;
  zoom: boolean;
  visible: boolean;
  icon_size: number;
  level: number;
  location_open: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  custom_props: any;
  lat: number;
  lng: number;
  altitude: number;
  category_type: string;
  catIid: number;
  catId: number;
  feed: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}

export interface LocationShape {
  type: 'polygon';

  color: string;
  /**
   *Value from 0 to 1
   */
  opacity: number;

  weight: number;
  colorNormal: string;
  opacityNormal: number;
  weightNormal: number;
  colorHover: string;
  opacityHover: number;
  weightHover: number;
  /**
   * Array of lat/lng pairs
   */
  paths: Array<Array<[number, number]>>;
  fillColor: string;
  fillOpacity: number;
  fillColorNormal: string;
  fillOpacityNormal: number;
  fillColorHover: string;
  fillOpacityHover: number;
  icon: boolean;
  position: Array<[number, number]>;
}

