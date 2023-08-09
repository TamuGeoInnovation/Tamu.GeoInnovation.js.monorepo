//////////////////////////////////////////////////////////////////////
//
// Standard Input Options
//
//////////////////////////////////////////////////////////////////////

import { ResponseFormat } from '@tamu-gisc/geoprocessing-core';

export interface ICommonServiceOptions {
  /**
   * Retrieve your API key @ https://geoservices.tamu.edu/UserServices/Profile/
   */
  apiKey: string;
  version?: '5.0';
}

//////////////////////////////////////////////////////////////////////
//
// Standard result wrapper
//
// All geoprocessing requests are wrapped in this response object
//
//////////////////////////////////////////////////////////////////////

export interface ITransactionResult<InputParametersType, ResultType> {
  statusCode: number;
  message: string;
  error: string | null;
  data: ITransactionData<InputParametersType, ResultType>;
}

export interface IPlatformVersion {
  major: number;
  minor: number;
  build: number;
  revision: number;
  majorRevision: number;
  minorRevision: number;
}

export interface ITransactionData<InputParametersType, ResultType> {
  version: IPlatformVersion;
  timeTaken: number;
  transactionGuid: string;
  apiHost: string;
  clientHost: string;
  queryStatusCode: string;
  inputParameterSet: InputParametersType;

  results: Array<ResultType>;
}

/////////////////////////////////////////////
//
// Address Normalization
//
/////////////////////////////////////////////

export type AddressProcessingAddressFormat = 'USPSPublication28' | 'USCensusTiger' | 'LACounty';

export interface IAddressProcessingOptions extends ICommonServiceOptions {
  nonParsedStreetAddress?: string;
  nonParsedStreetCity?: string;
  nonParsedStreetState?: string;
  nonParsedStreetZIP?: string;
  addressFormat?: Array<AddressProcessingAddressFormat>;
  responseFormat?: ResponseFormat;
  includeHeader?: boolean;
  notStore?: boolean;
}

export interface IAddressProcessingDeserializedInputParametersMap {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  version: string | null;
  apiKey: string | null;
  dontStoreTransactionDetails: boolean | null;
  addressFormatTypes: Array<AddressProcessingAddressFormat>;
  multiThreading: boolean | null;
  includeHeader: boolean | null;
  verbose: boolean | null;
  outputFormat: string | null;
}
/**
 * The fields that are returned in a parsed address result object.
 *
 * This is a cleaner version of using string values to access object properties.
 */
export enum ParsedAddressField {
  AddressLocationType = 'addressLocationType',
  AddressFormatType = 'addressFormatType',
  Number = 'number',
  NumberFractional = 'numberFractional',
  PreDirectional = 'preDirectional',
  PreQualifier = 'preQualifier',
  PreType = 'preType',
  PreArticle = 'preArticle',
  Name = 'name',
  PostArticle = 'postArticle',
  PostQualifier = 'postQualifier',
  PostDirectional = 'postDirectional',
  Suffix = 'suffix',
  SuiteType = 'suiteType',
  SuiteNumber = 'suiteNumber',
  City = 'city',
  MinorCivilDivision = 'minorCivilDivision',
  ConsolidatedCity = 'consolidatedCity',
  CountySubRegion = 'countySubRegion',
  County = 'county',
  State = 'state',
  Zip = 'zip',
  ZipPlus1 = 'zipPlus1',
  ZipPlus2 = 'zipPlus2',
  ZipPlus3 = 'zipPlus3',
  ZipPlus4 = 'zipPlus4',
  ZipPlus5 = 'zipPlus5',
  Country = 'country'
}

export interface IParsedAddress extends Record<string, string | null> {
  [ParsedAddressField.AddressLocationType]: string;
  [ParsedAddressField.AddressFormatType]: AddressProcessingAddressFormat;
  [ParsedAddressField.Number]: string;
  [ParsedAddressField.NumberFractional]: string | null;
  [ParsedAddressField.PreDirectional]: string | null;
  [ParsedAddressField.PreQualifier]: string | null;
  [ParsedAddressField.PreType]: string | null;
  [ParsedAddressField.PreArticle]: string;
  [ParsedAddressField.Name]: string;
  [ParsedAddressField.PostArticle]: string;
  [ParsedAddressField.PostQualifier]: string;
  [ParsedAddressField.PostDirectional]: string;
  [ParsedAddressField.Suffix]: string;
  [ParsedAddressField.SuiteType]: string;
  [ParsedAddressField.SuiteNumber]: string;
  [ParsedAddressField.City]: string;
  [ParsedAddressField.MinorCivilDivision]: string | null;
  [ParsedAddressField.ConsolidatedCity]: string | null;
  [ParsedAddressField.CountySubRegion]: string | null;
  [ParsedAddressField.County]: string | null;
  [ParsedAddressField.State]: string;
  [ParsedAddressField.Zip]: string;
  [ParsedAddressField.ZipPlus1]: string;
  [ParsedAddressField.ZipPlus2]: string;
  [ParsedAddressField.ZipPlus3]: string;
  [ParsedAddressField.ZipPlus4]: string;
  [ParsedAddressField.ZipPlus5]: string;
  [ParsedAddressField.Country]: string | null;
}

export interface IAddressProcessingStreetAddressRecord {
  timeTaken: number;
  exceptionOccurred: boolean;
  errorMessage: string | null;
  parsedAddress: IParsedAddress;
}

export type AddressProcessingResult = ITransactionResult<
  IAddressProcessingDeserializedInputParametersMap,
  IAddressProcessingStreetAddressRecord
>;

/////////////////////////////////////////////
//
// Census Intersection
//
/////////////////////////////////////////////

export interface ICensusIntersectionOptions extends ICommonServiceOptions {
  lat: number;
  lon: number;
  censusYears: 'allAvailable' | Array<'1990' | '2000' | '2010' | '2020'>;
  s?: string;
  format?: ResponseFormat;
  notStore?: boolean;
}

export interface ICensusIntersectionRecord {
  censusYear: number;
  geoLocationId: string;
  censusBlock: string;
  censusBlockGroup: string;
  censusTract: string;
  censusPlaceFips: string;
  censusMcdFips: string;
  censusMsaFips: string;
  censusMetDivFips: string;
  censusCbsaFips: string;
  censusCbsaMicro: string;
  censusCountyFips: string;
  censusStateFips: string;
  exceptionOccurred: boolean;
  exceptionMessage: string;
}

export type CensusIntersectionResult = ITransactionResult<undefined, ICensusIntersectionRecord>;

/////////////////////////////////////////////
//
// Reverse Geocoding
//
/////////////////////////////////////////////

export interface IReverseGeocoderOptions extends ICommonServiceOptions {
  latitude: number;
  longitude: number;
  state?: string;
  notStore?: boolean;
  format?: ResponseFormat;
}

interface IReverseGeocodeRecord {
  timeTaken: number;
  exceptionOccurred: boolean;
  errorMessage: string;
  apn: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  zipPlus4: string;
}

export type ReverseGeocodeResult = ITransactionResult<undefined, IReverseGeocodeRecord>;

/////////////////////////////////////////////
//
// Geocoding
//
/////////////////////////////////////////////

export enum GeocodeCensusYear {
  AllAvailable = 'allAvailable',
  Year1990 = '1990',
  Year2000 = '2000',
  Year2010 = '2010',
  Year2020 = '2020'
}

export enum GeocodeTieHandlingStrategyType {
  ChooseFirstOne = 'chooseFirstOne',
  FlipACoin = 'flipACoin',
  RevertToHierarchy = 'revertToHierarchy'
}

export enum GeocodeRelaxableAttribute {
  Pre = 'pre',
  Suffix = 'suffix',
  Post = 'post',
  City = 'city',
  Zip = 'zip'
}

export enum GeocodeSoundexAttribute {
  Name = 'name',
  City = 'city'
}

export enum GeocodeConfidenceLevel {
  DotGovernmentSites = 1,
  GovernmentSites = 2,
  DotUSSites = 3,
  CitySites = 4,
  CountySites = 5,
  DotEduSites = 6,
  PublicSites = 7,
  SourceNotLIsted = 8
}

export enum GeocodeReferenceFeature {
  All = 'all',
  MicrosoftFootprints = 'MicrosoftFootprints',
  CountyParcelData = 'CountyParcelData',
  NavteqAddressPoints2022 = 'NavteqAddressPoints2022',
  NavteqAddressPoints2021 = 'NavteqAddressPoints2021',
  NavteqAddressPoints2017 = 'NavteqAddressPoints2017',
  OpenAddresses = 'OpenAddresses',
  NavteqAddressPoints2016 = 'NavteqAddressPoints2016',
  NavteqAddressPoints2014 = 'NavteqAddressPoints2014',
  NavteqAddressPoints2013 = 'NavteqAddressPoints2013',
  NavteqAddressPoints2012 = 'NavteqAddressPoints2012',
  BoundarySolutionsParcelCentroids = 'BoundarySolutionsParcelCentroids',
  NavteqStreets2008 = 'NavteqStreets2008',
  NavteqStreets2012 = 'NavteqStreets2012',
  NavteqStreets2021 = 'NavteqStreets2021',
  Census2016TigerLines = 'Census2016TigerLines',
  Census2015TigerLines = 'Census2015TigerLines',
  Census2010TigerLines = 'Census2010TigerLines',
  USPSTigerZipPlus4 = 'USPSTigerZipPlus4',
  ZipCodeDownloadZips2013 = 'ZipCodeDownloadZips2013',
  Census2000ZCTAs = 'Census2000ZCTAs',
  Census2000Places = 'Census2000Places',
  Census2000ConsolidatedCities = 'Census2000ConsolidatedCities',
  Census2000CountySubRegions = 'Census2000CountySubRegions',
  Census2000Counties = 'Census2000Counties',
  Census2000States = 'Census2000States',
  Census2010ZCTAs = 'Census2010ZCTAs',
  Census2010Places = 'Census2010Places',
  Census2010ConsolidatedCities = 'Census2010ConsolidatedCities',
  Census2010CountySubRegions = 'Census2010CountySubRegions',
  Census2010Counties = 'Census2010Counties',
  Census2010States = 'Census2010States',
  Census2020ZCTAs = 'Census2020ZCTAs',
  Census2020Places = 'Census2020Places',
  Census2020ConsolidatedCities = 'Census2020ConsolidatedCities',
  Census2020CountySubRegions = 'Census2020CountySubRegions',
  Census2020Counties = 'Census2020Counties',
  Census2020States = 'Census2020States'
}

export interface IGeocodeOptions extends ICommonServiceOptions {
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: number;
  census?: boolean;
  censusYears?: GeocodeCensusYear.AllAvailable | Array<Exclude<GeocodeCensusYear, GeocodeCensusYear.AllAvailable>>;
  format?: ResponseFormat;
  includeHeader?: boolean;
  notStore?: boolean;
  verbose?: boolean;
  shouldOutputParsedAddress?: boolean;
  shouldOutputMatchedAddress?: boolean;
  shouldOutputReferenceFeature?: boolean;
  shouldOutputReferenceFeatureAddress?: boolean;

  /**
   * Defaults to `false`
   */
  allowTies?: boolean;

  /**
   * Defaults to `chooseFirstOne`
   */
  tieBreakingStrategy?: GeocodeTieHandlingStrategyType;

  /**
   * Defaults to `5 - County Sites`
   */
  confidenceLevels?: GeocodeConfidenceLevel;

  /**
   * Defaults to `95`;
   */
  minScore?: number;

  exhaustiveSearch?: boolean;
  aliasTables?: boolean;
  attributeRelaxation?: boolean;
  relaxableAttributes?: Array<GeocodeRelaxableAttribute>;
  substringMAtching?: boolean;
  soundex?: boolean;
  soundexableAttributes?: Array<GeocodeSoundexAttribute>;
  hierarchy?: boolean;
  /**
   * Reference data sources
   */
  refs?:
    | GeocodeReferenceFeature.All
    | Array<GeocodeReferenceFeature | Exclude<GeocodeReferenceFeature, GeocodeReferenceFeature.All>>;
  geometry?: boolean;
  multithreadedGeocoder?: boolean;
  outputStatistics?: boolean;
}

export enum GeocodeInputAttributeWeightingSchemeField {
  Number = 'number',
  NumberParity = 'numberParity',
  PreDirectional = 'preDirectional',
  PreType = 'preType',
  PreQualifier = 'preQualifier',
  PreArticle = 'preArticle',
  Name = 'name',
  PostArticle = 'postArticle',
  Suffix = 'suffix',
  PostDirectional = 'postDirectional',
  PostQualifier = 'postQualifier',
  City = 'city',
  Zip = 'zip',
  ZipPlus4 = 'zipPlus4',
  State = 'state',
  TotalWeight = 'totalWeight'
}

export interface IGeocodeAttributeWeightingScheme {
  [GeocodeInputAttributeWeightingSchemeField.Number]: number;
  [GeocodeInputAttributeWeightingSchemeField.NumberParity]: number;
  [GeocodeInputAttributeWeightingSchemeField.PreDirectional]: number;
  [GeocodeInputAttributeWeightingSchemeField.PreType]: number;
  [GeocodeInputAttributeWeightingSchemeField.PreQualifier]: number;
  [GeocodeInputAttributeWeightingSchemeField.PreArticle]: number;
  [GeocodeInputAttributeWeightingSchemeField.Name]: number;
  [GeocodeInputAttributeWeightingSchemeField.PostArticle]: number;
  [GeocodeInputAttributeWeightingSchemeField.Suffix]: number;
  [GeocodeInputAttributeWeightingSchemeField.PostDirectional]: number;
  [GeocodeInputAttributeWeightingSchemeField.PostQualifier]: number;
  [GeocodeInputAttributeWeightingSchemeField.City]: number;
  [GeocodeInputAttributeWeightingSchemeField.Zip]: number;
  [GeocodeInputAttributeWeightingSchemeField.ZipPlus4]: number;
  [GeocodeInputAttributeWeightingSchemeField.State]: number;
  [GeocodeInputAttributeWeightingSchemeField.TotalWeight]: number;
}

export enum GeocodeInputParamsField {
  StreetAddress = 'streetAddress',
  City = 'city',
  State = 'state',
  Zip = 'zip',
  ApiKey = 'apiKey',
  DontStoreTransactionDetails = 'dontStoreTransactionDetails',
  AllowTies = 'allowTies',
  TieHandlingStrategyType = 'tieHandlingStrategyType',
  Relaxation = 'relaxation',
  RelaxableAttributes = 'relaxableAttributes',
  Substring = 'substring',
  Soundex = 'soundex',
  SoundexAttributes = 'soundexAttributes',
  FeatureMatchingSelectionMethod = 'featureMatchingSelectionMethod',
  MinimumMatchScore = 'minimumMatchScore',
  ConfidenceLevels = 'confidenceLevels',
  ExhaustiveSearch = 'exhaustiveSearch',
  AliasTables = 'aliasTables',
  MultiThreading = 'multiThreading',
  IncludeHeader = 'includeHeader',
  Verbose = 'verbose',
  OutputCensusVariables = 'outputCensusVariables',
  OutputReferenceFeatureGeometry = 'outputReferenceFeatureGeometry',
  OutputFormat = 'outputFormat',
  CensusYears = 'censusYears',
  ReferenceSources = 'referenceSources'
}

export interface IGeocodeDeserializedInputParametersMap {
  [GeocodeInputParamsField.StreetAddress]: string;
  [GeocodeInputParamsField.City]: string;
  [GeocodeInputParamsField.State]: string;
  [GeocodeInputParamsField.Zip]: string;
  version: IPlatformVersion;
  [GeocodeInputParamsField.ApiKey]: string;
  [GeocodeInputParamsField.DontStoreTransactionDetails]: boolean;
  [GeocodeInputParamsField.AllowTies]: boolean;
  [GeocodeInputParamsField.TieHandlingStrategyType]: string;
  [GeocodeInputParamsField.RelaxableAttributes]: Array<string>;
  [GeocodeInputParamsField.Relaxation]: boolean;
  [GeocodeInputParamsField.Substring]: boolean;
  [GeocodeInputParamsField.Soundex]: boolean;
  [GeocodeInputParamsField.SoundexAttributes]: string;
  [GeocodeInputParamsField.ReferenceSources]: Array<string>;
  [GeocodeInputParamsField.FeatureMatchingSelectionMethod]: string;
  attributeWeightingScheme: IGeocodeAttributeWeightingScheme;
  [GeocodeInputParamsField.MinimumMatchScore]: number;
  [GeocodeInputParamsField.ConfidenceLevels]: number;
  [GeocodeInputParamsField.ExhaustiveSearch]: boolean;
  [GeocodeInputParamsField.AliasTables]: boolean;
  [GeocodeInputParamsField.MultiThreading]: boolean;
  [GeocodeInputParamsField.CensusYears]: Array<number>;
  [GeocodeInputParamsField.IncludeHeader]: boolean;
  [GeocodeInputParamsField.Verbose]: boolean;
  [GeocodeInputParamsField.OutputCensusVariables]: boolean;
  [GeocodeInputParamsField.OutputReferenceFeatureGeometry]: boolean;
  [GeocodeInputParamsField.OutputFormat]: string;
}

/**
 * The fields that are returned in a geocode reference feature result object.
 *
 * This is a cleaner version of using string values to access object properties.
 */
export enum GeocodeReferenceFeatureField {
  Address = 'address',
  Area = 'area',
  AreaType = 'areaType',
  Geometry = 'geometry',
  GeometrySRID = 'geometrySRID',
  Source = 'source',
  Vintage = 'vintage',
  ServerName = 'serverName',
  PrimaryIdField = 'primaryIdField',
  PrimaryIdValue = 'primaryIdValue',
  SecondaryIdField = 'secondaryIdField',
  SecondaryIdValue = 'secondaryIdValue',
  InterpolationType = 'interpolationType',
  InterpolationSubType = 'interpolationSubType'
}

export interface IGeocodeReferenceFeature {
  [GeocodeReferenceFeatureField.Address]: IParsedAddress;
  [GeocodeReferenceFeatureField.Area]: number;
  [GeocodeReferenceFeatureField.AreaType]: string;
  [GeocodeReferenceFeatureField.GeometrySRID]: string;
  [GeocodeReferenceFeatureField.Geometry]: string;
  [GeocodeReferenceFeatureField.Source]: string;
  [GeocodeReferenceFeatureField.Vintage]: number;
  [GeocodeReferenceFeatureField.ServerName]: string;
  [GeocodeReferenceFeatureField.PrimaryIdField]: string;
  [GeocodeReferenceFeatureField.PrimaryIdValue]: string;
  [GeocodeReferenceFeatureField.SecondaryIdField]: string;
  [GeocodeReferenceFeatureField.SecondaryIdValue]: string;
  [GeocodeReferenceFeatureField.InterpolationType]: string;
  [GeocodeReferenceFeatureField.InterpolationSubType]: string;
}

export interface IGeocodeNAACCR {
  gisCoordinateQualityCode: string;
  gisCoordinateQualityType: string;
  censusTractCertaintyCode: string;
  censusTractCertaintyType: string;
  microMatchStatus: string;
  penaltyCode: string;
  penaltyCodeSummary: string;
  penaltyCodeDetails: string;
}

export interface IGeocodeRecord {
  latitude: number;
  longitude: number;
  matchScore: number;
  geocodeQualityType: string;
  featureMatchingGeographyType: string;
  matchType: string;
  matchedLocationType: string;
  featureMatchingResultType: string;
  naaccr: IGeocodeNAACCR;
  queryStatusCodes: string;
  tieHandlingStrategyType: string;
  featureMatchingSelectionMethod: string;
  censusRecords: Array<ICensusIntersectionRecord>;
  matchedAddress: IParsedAddress;
  referenceFeature: IGeocodeReferenceFeature;
}

export type GeocodeResult = ITransactionResult<IGeocodeDeserializedInputParametersMap, IGeocodeRecord>;
