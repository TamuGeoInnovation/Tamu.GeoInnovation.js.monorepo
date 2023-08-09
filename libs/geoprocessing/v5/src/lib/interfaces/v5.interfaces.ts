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

export enum AddressProcessingAddressFormat {
  USPSPublication28 = 'USPSPublication28',
  USCensusTiger = 'USCensusTiger',
  LACounty = 'LACounty'
}

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
export enum ParsedAddressRecordField {
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

export interface IParsedAddressRecord {
  [ParsedAddressRecordField.AddressLocationType]: string;
  [ParsedAddressRecordField.AddressFormatType]: AddressProcessingAddressFormat;
  [ParsedAddressRecordField.Number]: string;
  [ParsedAddressRecordField.NumberFractional]: string | null;
  [ParsedAddressRecordField.PreDirectional]: string | null;
  [ParsedAddressRecordField.PreQualifier]: string | null;
  [ParsedAddressRecordField.PreType]: string | null;
  [ParsedAddressRecordField.PreArticle]: string;
  [ParsedAddressRecordField.Name]: string;
  [ParsedAddressRecordField.PostArticle]: string;
  [ParsedAddressRecordField.PostQualifier]: string;
  [ParsedAddressRecordField.PostDirectional]: string;
  [ParsedAddressRecordField.Suffix]: string;
  [ParsedAddressRecordField.SuiteType]: string;
  [ParsedAddressRecordField.SuiteNumber]: string;
  [ParsedAddressRecordField.City]: string;
  [ParsedAddressRecordField.MinorCivilDivision]: string | null;
  [ParsedAddressRecordField.ConsolidatedCity]: string | null;
  [ParsedAddressRecordField.CountySubRegion]: string | null;
  [ParsedAddressRecordField.County]: string | null;
  [ParsedAddressRecordField.State]: string;
  [ParsedAddressRecordField.Zip]: string;
  [ParsedAddressRecordField.ZipPlus1]: string;
  [ParsedAddressRecordField.ZipPlus2]: string;
  [ParsedAddressRecordField.ZipPlus3]: string;
  [ParsedAddressRecordField.ZipPlus4]: string;
  [ParsedAddressRecordField.ZipPlus5]: string;
  [ParsedAddressRecordField.Country]: string | null;
}

export interface IAddressProcessingStreetAddressRecord {
  timeTaken: number;
  exceptionOccurred: boolean;
  errorMessage: string | null;
  parsedAddress: IParsedAddressRecord;
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

export enum CensusYear {
  AllAvailable = 'allAvailable',
  Census1990 = '1990',
  Census2000 = '2000',
  Census2010 = '2010',
  Census2020 = '2020'
}

export interface ICensusIntersectionOptions extends ICommonServiceOptions {
  lat: number;
  lon: number;
  censusYears: CensusYear.AllAvailable | Array<Exclude<CensusYear, CensusYear.AllAvailable>>;
  s?: string;
  format?: ResponseFormat;
  notStore?: boolean;
}

export enum CensusIntersectionRecordField {
  CensusYear = 'censusYear',
  GeoLocationId = 'geoLocationId',
  CensusBlock = 'censusBlock',
  CensusBlockGroup = 'censusBlockGroup',
  CensusTract = 'censusTract',
  CensusPlaceFips = 'censusPlaceFips',
  CensusMcdFips = 'censusMcdFips',
  CensusMsaFips = 'censusMsaFips',
  CensusMetDivFips = 'censusMetDivFips',
  CensusCbsaFips = 'censusCbsaFips',
  CensusCbsaMicro = 'censusCbsaMicro',
  CensusCountyFips = 'censusCountyFips',
  CensusStateFips = 'censusStateFips',
  ExceptionOccurred = 'exceptionOccurred',
  ExceptionMessage = 'exceptionMessage'
}

export interface ICensusIntersectionRecord {
  [CensusIntersectionRecordField.CensusYear]: number;
  [CensusIntersectionRecordField.GeoLocationId]: string;
  [CensusIntersectionRecordField.CensusBlock]: string;
  [CensusIntersectionRecordField.CensusBlockGroup]: string;
  [CensusIntersectionRecordField.CensusTract]: string;
  [CensusIntersectionRecordField.CensusPlaceFips]: string;
  [CensusIntersectionRecordField.CensusMcdFips]: string;
  [CensusIntersectionRecordField.CensusMsaFips]: string;
  [CensusIntersectionRecordField.CensusMetDivFips]: string;
  [CensusIntersectionRecordField.CensusCbsaFips]: string;
  [CensusIntersectionRecordField.CensusCbsaMicro]: string;
  [CensusIntersectionRecordField.CensusCountyFips]: string;
  [CensusIntersectionRecordField.CensusStateFips]: string;
  [CensusIntersectionRecordField.ExceptionOccurred]: boolean;
  [CensusIntersectionRecordField.ExceptionMessage]: string;
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

export enum ReverseGeocodeRecordField {
  TimeTaken = 'timeTaken',
  ExceptionOccurred = 'exceptionOccurred',
  ErrorMessage = 'errorMessage',
  Apn = 'apn',
  StreetAddress = 'streetAddress',
  City = 'city',
  State = 'state',
  Zip = 'zip',
  ZipPlus4 = 'zipPlus4'
}

export interface IReverseGeocodeRecord {
  [ReverseGeocodeRecordField.TimeTaken]: number;
  [ReverseGeocodeRecordField.ExceptionOccurred]: boolean;
  [ReverseGeocodeRecordField.ErrorMessage]: string;
  [ReverseGeocodeRecordField.Apn]: string;
  [ReverseGeocodeRecordField.StreetAddress]: string;
  [ReverseGeocodeRecordField.City]: string;
  [ReverseGeocodeRecordField.State]: string;
  [ReverseGeocodeRecordField.Zip]: string;
  [ReverseGeocodeRecordField.ZipPlus4]: string;
}

export type ReverseGeocodeResult = ITransactionResult<undefined, IReverseGeocodeRecord>;

/////////////////////////////////////////////
//
// Geocoding
//
/////////////////////////////////////////////

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
  /**
   * .gov sites
   */
  DotGovernmentSites = 1,

  /**
   * Gov sites
   */
  GovernmentSites = 2,

  /**
   * .us sites
   */
  DotUSSites = 3,

  /**
   * City sites
   */
  CitySites = 4,

  /**
   * County sites
   */
  CountySites = 5,

  /**
   * .edu sites
   */
  DotEduSites = 6,

  /**
   * Public sites
   */
  PublicSites = 7,

  /**
   * Source not listed
   */
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
  censusYears?: CensusYear.AllAvailable | Array<Exclude<CensusYear, CensusYear.AllAvailable>>;
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
  [GeocodeReferenceFeatureField.Address]: IParsedAddressRecord;
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

export enum GeocodeNAACCRField {
  GisCoordinateQualityCode = 'gisCoordinateQualityCode',
  GisCoordinateQualityType = 'gisCoordinateQualityType',
  CensusTractCertaintyCode = 'censusTractCertaintyCode',
  CensusTractCertaintyType = 'censusTractCertaintyType',
  MicroMatchStatus = 'microMatchStatus',
  PenaltyCode = 'penaltyCode',
  PenaltyCodeSummary = 'penaltyCodeSummary',
  PenaltyCodeDetails = 'penaltyCodeDetails'
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

export enum GeocodeRecordField {
  Latitude = 'latitude',
  Longitude = 'longitude',
  MatchScore = 'matchScore',
  GeocodeQualityType = 'geocodeQualityType',
  FeatureMatchingGeographyType = 'featureMatchingGeographyType',
  MatchType = 'matchType',
  MatchedLocationType = 'matchedLocationType',
  FeatureMatchingResultType = 'featureMatchingResultType',
  Naaccr = 'naaccr',
  QueryStatusCodes = 'queryStatusCodes',
  TieHandlingStrategyType = 'tieHandlingStrategyType',
  FeatureMatchingSelectionMethod = 'featureMatchingSelectionMethod',
  CensusRecords = 'censusRecords',
  MatchedAddress = 'matchedAddress',
  ReferenceFeature = 'referenceFeature'
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
  matchedAddress: IParsedAddressRecord;
  referenceFeature: IGeocodeReferenceFeature;
}

export type GeocodeResult = ITransactionResult<IGeocodeDeserializedInputParametersMap, IGeocodeRecord>;
