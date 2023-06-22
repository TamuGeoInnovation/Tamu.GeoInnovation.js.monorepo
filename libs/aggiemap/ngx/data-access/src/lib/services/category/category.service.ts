import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import qs from 'qs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private _resource: string;

  constructor(private readonly env: EnvironmentService, private readonly http: HttpClient) {
    const connections = this.env.value('Connections');

    this._resource = connections.cms_url + 'categories';
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

    return this.http.get<CmsResponse<Category>>(this._resource + '?' + query);
  }
}

export interface CmsResponse<E> {
  data: Array<E>;
  meta: CmsResponseMetadata;
}

export interface CmsResponseMetadata {
  pagination: {
    page: number;
    pageCount: number;
    pageSize: number;
    total: number;
  };
}

export interface CmsDataEntity<E> {
  id: number;
  attributes: E;
}

export interface Category extends CmsDataEntity<Category> {
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

export interface CmsFile {
  name: string;
  alternativeText: string;
  caption: string;
  width: number;
  height: number;
  formats: null;
  hash: string;
  ext: string;
  mime: 'image/png';
  size: number;
  url: string;
  previewUrl: string;
  provider: string;
  provider_metadata: null;
  createdAt: Date;
  updatedAt: Date;
}
