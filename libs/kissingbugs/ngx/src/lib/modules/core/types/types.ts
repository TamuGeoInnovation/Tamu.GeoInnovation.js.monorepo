export type StrapiSingleTypes = 'home' | 'home-new' | 'found-a-bug' | 'navigation' | 'hero' | 'footer';

export type IStrapiLocales = 'en' | 'es';

export type IStrapiComponent =
  | IStrapiMedia
  | IStrapiPageSection
  | IStrapiPageInfoAlert
  | IStrapiPageFeature
  | IStrapiPageParagraph
  | IStrapiPageList;

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
  type: 'h1' | 'h2' | 'h3';
}

export interface IStrapiPageInfoAlert {
  __component: string;
  id: number;
  text: string;
  image: IStrapiMedia;
}

export interface IStrapiPageFeature {
  __component: string;
  id: number;
  credit: string;
  caption: string;
  media: IStrapiMedia;
}

export interface IStrapiPageGallery {
  __component: string;
  id: number;
  credit: string;
  caption: string;
  items: IStrapiPageFeature[];
}

export interface IStrapiPageParagraph {
  __component: string;
  id: number;
  text: string;
}

export interface IStrapiPageList {
  __component: string;
  id: number;
  list_items: IStrapiPageParagraph[];
}

export interface IStrapiLocale {
  id: number;
  locale: string;
  published_at: string;
}

export interface IStrapiStapleHero {
  id: number;
  titles: IStrapiPageParagraph[];
  statement: string;
  left_icon: IStrapiMedia;
  right_icon: IStrapiMedia;
  background: IStrapiMedia;
}

export interface IStrapiStapleFooter {
  id: number;
  text: string;
  image: IStrapiMedia;
}

export interface IStrapiNavigationItem {
  id: number;
  page: string;
  title: string;
}

export interface IStrapiNavigationPage {
  id: number;
  items: IStrapiNavigationItem[];
}
export interface IStrapiStapleNavigation {
  id: number;
  published_at: string;
  created_at: string;
  updated_at: string;
  items: (IStrapiNavigationItem | IStrapiNavigationPage)[];
}
export interface IStrapiPageResponse {
  id: number;
  locale: IStrapiLocales;
  published_at: string;
  created_at: string;
  updated_at: string;
  header: IStrapiStapleHero;
  body: IStrapiComponent[];
  footer: IStrapiStapleFooter;
  localizations: IStrapiLocale[];
}
