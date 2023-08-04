//////////////////////////////////////////////////////////////////////
//
// Standard Input Options
//
//////////////////////////////////////////////////////////////////////

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
  responseFormat?: 'csv' | 'tsv' | 'xml' | 'json';
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
  format?: 'csv' | 'tsv' | 'xml' | 'json';
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
  format?: 'csv' | 'tsv' | 'xml' | 'json';
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

export interface IGeocodeOptions extends ICommonServiceOptions {
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: number;
  census?: boolean;
  censusYears?: 'allAvailable' | Array<'1990' | '2000' | '2010' | '2020'>;
  format?: 'csv' | 'tsv' | 'xml' | 'json';
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
  tieBreakingStrategy?: 'chooseFirstOne' | 'flipACoin' | 'revertToHierarchy';

  /**
   * Defaults to `5`
   */
  confidenceLevels?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

  /**
   * Defaults to `95`;
   */
  minScore?: number;

  exhaustiveSearch?: boolean;
  aliasTables?: boolean;
  attributeRelaxation?: boolean;
  relaxableAttributes?: Array<'pre' | 'suffix' | 'post' | 'city' | 'zip'>;
  substringMAtching?: boolean;
  soundex?: boolean;
  soundexableAttributes?: Array<'name' | 'city'>;
  hierarchy?: boolean;
  /**
   * Reference data sources
   */
  refs?:
    | 'all'
    | Array<
        | 'MicrosoftFootprints'
        | 'CountyParcelData'
        | 'NavteqAddressPoints2022'
        | 'NavteqAddressPoints2021'
        | 'NavteqAddressPoints2017'
        | 'OpenAddresses'
        | 'NavteqAddressPoints2016'
        | 'NavteqAddressPoints2014'
        | 'NavteqAddressPoints2013'
        | 'NavteqAddressPoints2012'
        | 'BoundarySolutionsParcelCentroids'
        | 'NavteqStreets2008'
        | 'NavteqStreets2012'
        | 'NavteqStreets2021'
        | 'Census2016TigerLines'
        | 'Census2015TigerLines'
        | 'Census2010TigerLines'
        | 'USPSTigerZipPlus4'
        | 'ZipCodeDownloadZips2013'
        | 'Census2010ZCTAs'
        | 'Census2010Places'
        | 'Census2010ConsolidatedCities'
        | 'Census2010CountySubRegions'
        | 'Census2010Counties'
        | 'Census2010States'
      >;
  geometry?: boolean;
  multithreadedGeocoder?: boolean;
  outputStatistics?: boolean;
}

export interface IGeocodeDeserializedInputParametersMap {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  version: IPlatformVersion;
  apiKey: string;
  dontStoreTransactionDetails: boolean;
  allowTies: boolean;
  tieHandlingStrategyType: string;
  relaxableAttributes: Array<string>;
  relaxation: boolean;
  substring: boolean;
  soundex: boolean;
  soundexAttributes: string;
  referenceSources: Array<string>;
  featureMatchingSelectionMethod: string;
  attributeWeightingScheme: {
    number: number;
    numberParity: number;
    preDirectional: number;
    preType: number;
    preQualifier: number;
    preArticle: number;
    name: number;
    postArticle: number;
    suffix: number;
    postDirectional: number;
    postQualifier: number;
    city: number;
    zip: number;
    zipPlus4: number;
    state: number;
    totalWeight: number;
  };
  minimumMatchScore: number;
  confidenceLevels: number;
  exhaustiveSearch: boolean;
  aliasTables: boolean;
  multiThreading: boolean;
  censusYears: Array<number>;
  includeHeader: boolean;
  verbose: boolean;
  outputCensusVariables: boolean;
  outputReferenceFeatureGeometry: boolean;
  outputFormat: string;
}

export interface IGeocodeReferenceFeature {
  address: IParsedAddress;
  area: number;
  areaType: string;
  geometrySRID: string;
  geometry: string;
  source: string;
  vintage: number;
  serverName: string;
  primaryIdField: string;
  primaryIdValue: string;
  secondaryIdField: string;
  secondaryIdValue: string;
  interpolationType: string;
  interpolationSubType: string;
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

