import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

export type StrapiSingleTypes =
  | 'home'
  | 'found-a-bug'
  | 'map'
  | 'team'
  | 'faq'
  | 'resources'
  | 'knowledge'
  | 'contact'
  | 'navigation'
  | 'funder'
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
  __component?: string;
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
  anchor?: string;
}

export interface IStrapiPageInfoAlert {
  __component: string;
  id: number;
  text: string;
  file: IStrapiMedia;
  preview: IStrapiMedia;
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

export interface IStrapiPagePortraitGallery {
  __component: string;
  id: number;
  credit: string;
  caption: string;
  portraits: IStrapiPagePortrait[];
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

export interface IStrapiTableRow {
  __component: string;
  id: number;
  species: string;
  location: string;
  numTested: number;
  numInfected: number;
  percent: number;
}

export interface IStrapiTable {
  __component: string;
  id: number;
  data: IStrapiTableRow[];
  header: string[];
}

export interface IStrapiPrintResource {
  __component: string;
  id: number;
  file: IStrapiMedia;
  fileName: string;
  preview: IStrapiMedia;
}

export interface IStrapiPrintGallery {
  __component: string;
  id: number;
  resources: IStrapiPrintResource[];
}

export interface IStrapiPublication {
  __component: string;
  id: number;
  citation: string;
  quote: string;
  link: string;
}

export interface IStrapiPublicationGallery {
  __component: string;
  id: number;
  publications: IStrapiPublication[];
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
  fa_icon: string;
}

export interface IStrapiFooterItem {
  id: number;
  title: string;
  value: string;
}
export interface IStrapiStapleFooter {
  id: number;
  year: IStrapiFooterItem;
  contact: IStrapiFooterItem;
  disclaimer: IStrapiFooterItem;
}

export interface IStrapiStapleFunder {
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
  __component?: string;
  id: number;
  text: string;
  section: number;
}

export interface IStrapiFAQItemsWithComponents {
  __component?: string;
  questions: IStrapiFAQItem[];
  sections: IStrapiPageSection[];
}

export interface IStrapiPageFAQComponent {
  __component?: string;
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

export interface IContactBugSubmission extends IMailroomEmailOutbound {
  firstName: string;
  lastName: string;
  message: string;
  dateOfEncounter: string;
  timeOfEncounter: string;
  locationOfEncounter: string;
  stateOfEncounter: string;
  associatedWithBite: string;
  behaviour: string;
  file1: string;
  file2: string;
}

export interface IStrapiBugRecord {
  id: number;
  month: string;
  countyFips: string;
  species: string;
  created_at: string;
  updated_at: string;
}

export interface GeoJSONFeatureCollection {
  type: string;
  features: GeoJSONFeature[];
}

export interface GeoJSONFeature {
  type: string;
  properties: { [key: string]: string | boolean | number };
  geometry: GeoJSONPolygonFeature | GeoJSONMultiPolygonFeature;
}

export interface GeoJSONMultiPolygonFeature {
  coordinates: number[][][][];
  type: 'MultiPolygon';
}

export interface GeoJSONPolygonFeature {
  coordinates: number[][];
  type: 'Polygon';
}

export interface IStrapiBugCount {
  FIPS: string;
  Count: number;
}
