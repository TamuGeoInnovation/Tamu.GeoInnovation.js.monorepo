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
      populate: ['list_icon', 'icon'],
      // TODO: Fix
      publicationState: 'preview'
    });

    return this.http.get<CmsResponse<CategoryEntry>>(this._resource + '?' + query);
  }

  public getCategory(id: number) {
    const query = qs.stringify({
      filters: {
        catId: {
          $eq: id
        }
      },
      populate: ['list_icon', 'icon'],
      // TODO: Fix
      publicationState: 'preview'
    });

    return this.http.get<CmsResponse<CategoryEntry>>(this._resource + '?' + query);
  }
}

interface ICategoryEntry {
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
  feed_data: unknown;
  hidden: boolean;
  icon_size: number;
  keywords: string;
  labels: string;
  lat: number;
  level: number;
  list_icon?: CategoryIcon;
  icon?: CategoryIcon;
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
  schedule: unknown;
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

export type CategoryEntry = CmsDataEntity<ICategoryEntry>;
export type CategoryIcon = CmsFile;
