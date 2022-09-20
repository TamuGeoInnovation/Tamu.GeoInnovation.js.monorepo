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

export interface IParsedAddress {
  addressLocationType: string;
  addressFormatType: AddressProcessingAddressFormat;
  number: string;
  numberFractional: string | null;
  preDirectional: string | null;
  preQualifier: string | null;
  preType: string | null;
  preArticle: string;
  name: string;
  postArticle: string;
  postQualifier: string;
  postDirectional: string;
  suffix: string;
  suiteType: string;
  suiteNumber: string;
  city: string;
  minorCivilDivision: string | null;
  consolidatedCity: string | null;
  countySubRegion: string | null;
  county: string | null;
  state: string;
  zip: string;
  zipPlus1: string;
  zipPlus2: string;
  zipPlus3: string;
  zipPlus4: string;
  zipPlus5: string;
  country: string | null;
}

export interface IAddressProcessingStreetAddressRecord {
  timeTaken: number;
  exceptionOcurred: boolean;
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
