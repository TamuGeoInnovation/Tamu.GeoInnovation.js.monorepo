export interface CmsResponse<E> {
  data: Array<E>;
  meta: CmsResponseMetadata;
}

export interface CmsResponseSingle<E> {
  data: E;
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

interface ICmsFile {
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

export type CmsFile = CmsResponseSingle<CmsDataEntity<ICmsFile>>;