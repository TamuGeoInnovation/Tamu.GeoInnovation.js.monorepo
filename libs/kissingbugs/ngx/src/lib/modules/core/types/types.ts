export type StrapiPages = 'home' | 'found-a-bug';

export type IStrapiLocales = 'en' | 'es';

export type IStrapiComponent =
  | IStrapiMedia
  | IStrapiPageSection
  | IStrapiPageInfoAlert
  | IStrapiPageBugImage
  | IStrapiPageParagraph;

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

export interface IStrapiPageInfoBlock {
  __component: string;
  id: number;
  title: string;
  subtitle: string;
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

export interface IStrapiLocale {
  id: number;
  locale: string;
  published_at: string;
}
export interface IStrapiPageResponse {
  id: number;
  locale: IStrapiLocales;
  published_at: string;
  created_at: string;
  updated_at: string;
  header: {
    id: number;
    title: string;
    icon: IStrapiMedia;
    background: IStrapiMedia;
  };
  body: IStrapiComponent[];
  footer: {
    id: number;
    text: string;
    image: IStrapiMedia;
  };
  localizations: IStrapiLocale[];
}
