export interface IStrapiMediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  path: string;
  url: string;
}

export interface IStrapiMedia extends IStrapiMediaFormat {
  id: number;
  alternativeText: string;
  caption: string;
  previewUrl: string;
  provider: string;
  provider_metadata: string;
  created_at: string;
  updated_at: string;
  formats: {
    thumbnail: IStrapiMediaFormat;
    large: IStrapiMediaFormat;
    medium: IStrapiMediaFormat;
    small: IStrapiMediaFormat;
  };
}

export interface IStrapiPageSection {
  __component: string;
  id: number;
  title: string;
  text: string;
}

export interface IStrapiPageInfoAlert {
  __component: string;
  id: number;
  text: string;
  image: IStrapiMedia;
}

export interface IStrapiPageBugImage {
  __component: string;
  id: number;
  credit: string;
  caption: string;
  image: IStrapiMedia;
}

export interface IStrapiPageParagraph {
  __component: string;
  id: number;
  text: string;
}
