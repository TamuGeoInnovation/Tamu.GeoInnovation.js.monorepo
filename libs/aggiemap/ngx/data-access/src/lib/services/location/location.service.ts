import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import qs from 'qs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { CmsDataEntity, CmsResponse } from '../../types/types';

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

  /**
   * Fetches an individual location by its ID and plucks the location_medias sub-resource.
   */
  public getMediasForLocation(locationId: number): Observable<Array<LocationMedia>> {
    const query = qs.stringify({
      filters: {
        mrkId: locationId
      },
      fields: ['mrkId'],
      populate: ['location_medias']
    });

    return this.http.get<CmsResponse<LocationEntry>>(`${this._resource}?${query}`).pipe(
      map((res) => {
        return res.data[0].attributes.location_medias.data;
      })
    );
  }
}

interface ILocationEntry {
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
  marker_feed: unknown;
  popup: string;
  popup_url: string;
  reference: string;
  custom_data: string;
  shape: ILocationShape;
  schedule: string;
  zoom: boolean;
  visible: boolean;
  icon_size: number;
  level: number;
  location_open: string;
  custom_props: unknown;
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
  location_medias: CmsResponse<LocationMedia>;
}

interface ILocationShape extends LocationShapeBase {
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
  fillColor: string;
  fillOpacity: number;
  fillColorNormal: string;
  fillOpacityNormal: number;
  fillColorHover: string;
  fillOpacityHover: number;
  icon: boolean;
  position: Array<[number, number]>;
}

interface ILocationMedia {
  type: 'image' | 'image_url' | 'video_yt' | 'video_vim' | 'panorama';
  title: string;
  alt_text: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}

interface LocationShapeBase {
  type: LocationGeometryType;
}

// This is just an alias to keep consistent with the different types of shapes
export type LocationPoint = ILocationShape;

export interface LocationMultiPoint extends LocationShapeBase {
  type: LocationGeometryType.MULTI_POINT;
  latlngs: Array<Array<[number, number]>>;
}

export interface LocationPolyline extends ILocationShape {
  type: LocationGeometryType.POLY_LINE;
  path: Array<Array<[number, number]>>;
}

export interface LocationPolygon extends ILocationShape {
  type: LocationGeometryType.POLYGON;
  /**
   * Array of lat/lng pairs
   */
  paths: Array<Array<[number, number]>>;
}

export type LocationEntry = CmsDataEntity<ILocationEntry>;
export type LocationMedia = CmsDataEntity<ILocationMedia>;

export enum LocationGeometryType {
  MULTI_POINT = 'polymarker',
  POLY_LINE = 'polyline',
  POLYGON = 'polygon'
}
