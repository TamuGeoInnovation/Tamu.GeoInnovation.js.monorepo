export type StrapiPages = 'home' | 'home-new' | 'found-a-bug';

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
  type: 'h1' | 'h2' | 'h3';
}

export interface IStrapiPageInfoAlert {
  __component: string;
  id: number;
  text: string;
  image: IStrapiMedia;
}

// TODO: Remove IStrapiPageBugImage
export interface IStrapiPageBugImage {
  __component: string;
  id: number;
  credit: string;
  caption: string;
  image: IStrapiMedia;
}

export interface IStrapiPageFeature {
  __component: string;
  id: number;
  credit: string;
  caption: string;
  media: IStrapiMedia;
}

export interface IStrapiPageParagraph {
  __component: string;
  id: number;
  text: string;
}

export interface IStrapiPageHeroTitle {
  __component: string;
  id: number;
  title: string;
}

export interface IStrapiLocale {
  id: number;
  locale: string;
  published_at: string;
}

export interface IStrapiPageHero {
  id: number;
  titles: IStrapiPageHeroTitle[];
  statement: string;
  left_icon: IStrapiMedia;
  right_icon: IStrapiMedia;
  background: IStrapiMedia;
}

export interface IStrapiPageFooter {
  id: number;
  text: string;
  image: IStrapiMedia;
}
export interface IStrapiPageResponse {
  id: number;
  locale: IStrapiLocales;
  published_at: string;
  created_at: string;
  updated_at: string;
  header: IStrapiPageHero;
  body: IStrapiComponent[];
  footer: IStrapiPageFooter;
  localizations: IStrapiLocale[];
}
