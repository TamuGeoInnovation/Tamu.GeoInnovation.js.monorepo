import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import qs from 'qs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { CmsDataEntity, CmsFile, CmsResponse } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private _resource: string;

  constructor(private readonly env: EnvironmentService, private readonly http: HttpClient) {
    const connections = this.env.value('Connections');

    this._resource = connections.cms_api + 'categories';
  }

  public getCategories(parent?: number) {
    const query = qs.stringify({
      filters: {
        visible: {
          $eq: true
        },
        parent: {
          $eq: parent || 0
        },
        private: {
          $eq: false
        },
        hidden: {
          $eq: false
        }
      },
      populate: ['list_icon']
    });

    return this.http.get<CmsResponse<CategoryEntry>>(this._resource + '?' + query);
  }
}

export interface CategoryEntry extends CmsDataEntity<CategoryEntry> {
  author: string;
  catId: number;
  catIid: number;
  changed: Date;
  checkbox: boolean;
  createdAt: Date;
  default_state: boolean;
  description: string;
  dynamic_label: boolean;
  edited: string;
  feed: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  feed_data: any;
  hidden: boolean;
  icon_size: number;
  keywords: string;
  labels: string;
  lat: number;
  level: number;
  list_icon?: CategoryListIcon;
  lng: number;
  location_display: string;
  locked: boolean;
  map_alt: number;
  marker_alt: number;
  name: string;
  panorama: boolean;
  parent: number;
  popup: string;
  popup_url: string;
  private: boolean;
  publishedAt: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schedule: any;
  searchable: boolean;
  shared: boolean;
  single_select: boolean;
  tile_params: string;
  tile_type: string;
  tile_url: string;
  type: string;
  updatedAt: Date;
  visible: boolean;
  weight: number;
  zoom: boolean;
}

export type CategoryListIcon = CmsResponse<CmsFile>;
