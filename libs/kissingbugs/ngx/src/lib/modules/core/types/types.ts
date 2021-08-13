export type StrapiSingleTypes =
  | 'home'
  | 'found-a-bug'
  | 'map'
  | 'team'
  | 'faq'
  | 'resources'
  | 'contact'
  | 'navigation'
  | 'footer';

export type IStrapiLocales = 'en' | 'es';

export type IStrapiComponent =
  | IStrapiMedia
  | IStrapiPageSection
  | IStrapiPageInfoAlert
  | IStrapiPageFeature
  | IStrapiPageGallery
  | IStrapiPagePrintResource
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
  file: IStrapiMedia;
}

export interface IStrapiPageFeature {
  __component: string;
  id: number;
  credit: string;
  caption: string;
  media: IStrapiMedia;
}

export interface IStrapiPagePortrait {
  __component: string;
  id: number;
  site: string;
  name: string;
  bio: string;
  education: string;
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

export interface IStrapiPagePrintResource {
  __component: string;
  id: number;
  fileName: string;
  file: IStrapiMedia;
}

export interface IStrapiFAQItem {
  id: number;
  text: string;
  section: number;
}

export interface IStrapiFAQItemsWithComponents {
  questions: IStrapiFAQItem[];
  sections: IStrapiPageSection[];
}

export interface IStrapiPageFAQComponent {
  sectionId: number;
  text: string;
  components: IStrapiComponent[];
}

export interface IStrapiPageResponse {
  id: number;
  locale: IStrapiLocales;
  published_at: string;
  created_at: string;
  updated_at: string;
  hero: IStrapiStapleHero;
  section: IStrapiComponent[];
  questions: IStrapiFAQItem[];
  footer: IStrapiStapleFooter;
  localizations: IStrapiLocale[];
}
