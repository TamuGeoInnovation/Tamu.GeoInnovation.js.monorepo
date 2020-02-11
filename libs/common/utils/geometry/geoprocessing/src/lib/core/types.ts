/**
 * Standard callback function signature interface
 */
export interface CallBack<T> {
  (err: Error, res: T): void;
}

/**
 * Maps a flat interface and for every key entry,
 * assigns a DefaultTransformer interface, with the
 * current iterating key's type as a parameter.
 *
 * Interpretation: Interface for a settings tree with definitions on
 * default values, transformation functions, and target keys whose values
 * are injected into the transformation function, if any
 */
export type TransformersMap<U> = {
  [P in keyof U]?: Transformer<U[P], U>;
};

/**
 * Interface for a default transformer object.
 *
 * This is used to set tool default values and a function
 * definition
 *
 * @template U Value type
 */
export interface Transformer<U, O> {
  /**
   * Default value for the key-ed setting.
   *
   * Once values are patched and defaults calculated, this will
   * reflect the latest value if it underwent any transformation.
   */
  value: U;

  /**
   * Exclude the parent key and associated value when constructing query
   * param strings.
   */
  excludeParams?: boolean;

  /**
   * String or array of string parent key values whose associated values are passed into
   * the transformation function.
   */
  target?: keyof O | Array<keyof O>;

  /**
   * Transformation function. If defined, on default value calculation the `target values
   * will be provided as function arguments.
   */
  fn?: (...args) => void;
}
export interface IGeocoderThreeZeroOneOptions {
  version: '3.01';
  apiKey: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: number;
  census?: boolean;
  censusYear?: '1990' | '2000' | '2010';
  format?: 'csv' | 'tsv' | 'xml' | 'kml' | 'googleMapsUrl';
  includeHeader?: boolean;
  notStore?: boolean;
}

export interface IGeocoderFourZeroOneOptions
  extends Omit<IGeocoderThreeZeroOneOptions, 'version' | 'format' | 'censusYear' | 'format'> {
  version: '4.01';
  allowTies?: boolean;
  tieBreakingStrategy?: 'flipACoin' | 'revertToHierarchy';
  censusYear?: 'allAvailable' | Array<'1990' | '2000' | '2010'>;
  geom?: boolean;
  verbose?: boolean;
  format?: 'csv' | 'tsv' | 'xml' | 'json';
}

export interface IAdvancedGeocoderFourZeroOneOptions extends IGeocoderFourZeroOneOptions {
  r?: boolean;
  ratts?: Array<'pre' | 'suffix' | 'post' | 'city' | 'zip'>;
  sub?: boolean;
  sou?: boolean;
  souatts?: Array<'name' | 'city'>;
  h?: 'uncertaintyBased' | 'u' | 'f' | 'FeatureMatchingSelectionMethod';
  refs?:
    | 'all'
    | Array<
        | 'countyParcelData'
        | 'OpenAddresses'
        | 'navteqAddressPoints2017'
        | 'navteqAddressPoints2016'
        | 'navteqAddressPoints2014'
        | 'navteqAddressPoints2013'
        | 'navteqAddressPoints2012'
        | 'parcelCentroids'
        | 'boundarySolutionsParcelCentroids'
        | 'parcelGeometries'
        | 'navteqStreets2012'
        | 'navteqStreets2008'
        | 'tiger2016'
        | 'tiger2015'
        | 'tiger2010'
        | 'zipPlus4'
        | 'census2010Places'
        | 'census2008Places'
        | 'census2000Places'
        | 'census2010ConsolidatedCities'
        | 'census2008ConsolidatedCities'
        | 'census2000ConsolidatedCities'
        | 'census2000MCDs'
        | 'census2010ZCTAs'
        | 'census2008ZCTAs'
        | 'census2000ZCTAs'
        | 'zcdZips2013'
        | 'zcdZips2013'
        | 'census2008CountySubRegions'
        | 'census2000CountySubRegions'
        | 'census2010Counties'
        | 'census2008Counties'
        | 'census2000Counties'
        | 'census2010States'
        | 'census2008States'
      >;
}

export type IGeocoderOptions =
  | IGeocoderThreeZeroOneOptions
  | IGeocoderFourZeroOneOptions
  | IAdvancedGeocoderFourZeroOneOptions;

export interface IReverseGeocoderOptions {
  version?: '4.10';
  apiKey: string;
  lat: number;
  lon: number;
  state?: string;
  geom?: boolean;
  includeHeader?: boolean;
  notStore?: boolean;
  format?: 'csv' | 'tsv' | 'xml' | 'json';
}

export interface ICensusIntersectionOptions {
  apiKey: string;
  version: '4.10';
  censusYear: '1990' | '2000' | '2010';
  lat: number;
  lon: number;
  s?: boolean;
  format?: 'csv' | 'tsv' | 'xml' | 'json';
  notStore?: boolean;
}

export interface IKNearestOptions {
  apiKey: string;
  version: '4.10';
  lat: number;
  lon: number;
  k: number;
  table: 'AQMDs' | 'MammographyClinics' | 'RadiationFacilities';
  format?: 'csv' | 'tsv' | 'json' | 'xml';
  notStore?: boolean;
}

export interface IAddressParsingOptions {
  apiKey: string;
  version: '4.10';
  nonParsedStreetAddress?: string;
  nonParsedCity?: string;
  nonParsedState?: string;
  nonParsedZip?: string;
  addressFormat?: 'USPSPublication28' | 'USCensusTiger' | 'LACounty';
  responseFormat?: 'csv' | 'tsv' | 'xml' | 'json';
  notStore?: boolean;
}
//
// Results
//
export interface IGeocoderFourZeroOneResultMetadata {
  version: string;
  TransactionId: string;
  Version: string;
  QueryStatusCodeValue: string;
  FeatureMatchingResultType: string;
  FeatureMatchingResultCount: string;
  TimeTaken: string;
  ExceptionOccured: string;
  Exception: string;
}

export interface IGeocodeResultInputAddress {
  StreetAddress: string;
  City: string;
  State: string;
  Zip: string;
}

export interface IGeocodeResultOutputGeocode {
  OutputGeocode: {
    Latitude: string;
    Longitude: string;
    NAACCRGISCoordinateQualityCode: string;
    NAACCRGISCoordinateQualityType: string;
    MatchScore: string;
    MatchType: string;
    FeatureMatchingResultType: string;
    FeatureMatchingResultCount: string;
    FeatureMatchingGeographyType: string;
    RegionSize: string;
    RegionSizeUnits: string;
    MatchedLocationType: string;
    ExceptionOccured: string;
    Exception: string;
    ErrorMessage: string;
  };
}

export interface IGeocodeResultCensusValue {
  CensusYear: 'NineteenNinety' | 'TwoThousand' | 'TwoThousandTen';
  CensusTimeTaken: string;
  NAACCRCensusTractCertaintyType: string;
  CensusBlock: string;
  CensusBlockGroup: string;
  CensusTract: string;
  CensusCountyFips: string;
  CensusStateFips: string;
  CensusCbsaFips: string;
  CensusCbsaMicro: string;
  CensusMcdFips: string;
  CensusMetDivFips: string;
  CensusMsaFips: string;
  CensusPlaceFips: string;
  ExceptionOccured: string;
  Exception: string;
  ErrorMessage: string;
}

export interface IGecodeResultParsedAddress {
  Name: string;
  Number: string;
  NumberFractional: string;
  PreDirectional: string;
  PreQualifier: string;
  PreType: string;
  PreArticle: string;
  PostArticle: string;
  PostQualifier: string;
  Suffix: string;
  PostDirectional: string;
  SuiteType: string;
  SuiteNumber: string;
  PostOfficeBoxType: string;
  PostOfficeBoxNumber: string;
  City: string;
  ConsolidatedCity: string;
  MinorCivilDivision: string;
  CountySubRegion: string;
  County: string;
  State: string;
  Zip: string;
  ZipPlus1: string;
  ZipPlus2: string;
  ZipPlus3: string;
  ZipPlus4: string;
  ZipPlus5: string;
}

export interface IGeocodeResultReferenceFeature extends IGecodeResultParsedAddress {
  Area: string;
  AreaType: string;
  GeometrySRID: string;
  Geometry: string;
  Source: string;
  Vintage: string;
  PrimaryIdField: string;
  PrimaryIdValue: string;
  SecondaryIdField: string;
  SecondaryIdValue: string;
}

export interface IGeocodeResult extends IGeocoderFourZeroOneResultMetadata {
  InputAddress: IGeocodeResultInputAddress;
  OutputGeocodes: Array<IGeocodeResultOutputGeocode>;
  CensusValues: Array<{
    CensusValue1: IGeocodeResultCensusValue;
    CensusValue2: IGeocodeResultCensusValue;
    CensusValue3: IGeocodeResultCensusValue;
  }>;
  ParsedAddress: IGecodeResultParsedAddress;
  MatchedAddress: IGecodeResultParsedAddress;
  ReferenceFeature: IGeocodeResultReferenceFeature;
}

interface IReverseGeocodeResultStreetAddress {
  TransactionId: string;
  Version: string;
  QueryStatusCode: string;
  TimeTaken: string;
  Exception: string;
  ErrorMessage: string;
  APN: string;
  StreetAddress: string;
  City: string;
  State: string;
  Zip: string;
  ZipPlus4: string;
}

export interface IReverseGeocodeResult {
  TransactionId: string;
  Version: string;
  QueryStatusCode: string;
  TimeTaken: string;
  Exception: string;
  ErrorMessage: string;
  StreetAddresses: Array<IReverseGeocodeResultStreetAddress>;
}

export interface ICensusIntersectionResult {
  TransactionId: string;
  Version: string;
  QueryStatusCode: string;
  TimeTaken: string;
  Exception: string;
  ErrorMessage: string;
  CensusRecords: Array<ICensusIntersectionCensusRecord>;
}

export interface ICensusIntersectionCensusRecord {
  TransactionId: string;
  Version: string;
  QueryStatusCode: string;
  TimeTaken: string;
  Exception: string;
  ErrorMessage: string;
  CensusYear: string;
  CensusBlock: string;
  CensusBlockGroup: string;
  CensusTract: string;
  CensusPlaceFips: string;
  CensusMcdFips: string;
  CensusMsaFips: string;
  CensusCbsaFips: string;
  CensusCbsaMicro: string;
  CensusMetDivFips: string;
  CensusCountyFips: string;
  CensusStateFips: string;
}

export interface IKNearestResult {
  TransactionId: string;
  Version: string;
  QueryStatusCode: string;
  TimeTaken: string;
  Exception: string;
  ErrorMessage: string;
  NearestFeatures: Array<IKNearestFeatureRecord>;
}

export interface IKNearestFeatureRecord {
  TransactionId: string;
  Version: string;
  QueryStatusCode: string;
  TimeTaken: string;
  Exception: string;
  ErrorMessage: string;
  FeatureId: string;
  Latitude: string;
  Longitude: string;
  Distance: string;
}

export interface IAddressParsingResult {
  TransactionId: string;
  Version: string;
  QueryStatusCode: string;
  StreetAddresses: Array<IAddressParsingStreetAddressRecord>;
}

export interface IAddressParsingStreetAddressRecord {
  Number: string;
  NumberFractional: string;
  PreDirectional: string;
  PreQualifier: string;
  PreType: string;
  PreArticle: string;
  StreetName: string;
  Suffix: string;
  PostArticle: string;
  PostQualifier: string;
  PostDirectional: string;
  SuiteType: string;
  SuiteNumber: string;
  City: string;
  State: string;
  ZIP: string;
  ZIPPlus1: string;
  ZIPPlus2: string;
  ZIPPlus3: string;
  ZIPPlus4: string;
  ZIPPlus5: string;
  PostOfficeBoxType: string;
  PostOfficeBoxNumber: string;
}

//
// Errors
//
export interface INormalizedGeoservicesJsonError<T> {
  statusCode?: number | string;
  error?: string;
  message?: string;
  response?: T;
}

export type NormalizedGeoservicesTextError = string;

export type NormalizedXMLError = XMLDocument;

export enum ApiResponseFormat {
  /**
   * Responses where the response contains a text status code **name**
   */
  Text = 1,
  /**
   * Responses where the response contains a numeric status code
   */
  Code = 2
}
