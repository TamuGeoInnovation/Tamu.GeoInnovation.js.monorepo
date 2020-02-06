/**
 * Standard callback function signature interface
 */
export interface ICallBack<T> {
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
export type MappedTransformers<U> = {
  [P in keyof U]?: ValueTransformer<U[P]>;
};

/**
 * Interface for a default transformer object.
 *
 * This is used to set tool default values and a function
 * definition
 *
 * @template U Value type
 */
export interface ValueTransformer<U> {
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
  target?: string | string[];

  /**
   * Transformation function. If defined, on default value calculation the `target values
   * will be provided as function arguments.
   */
  fn?: (...args) => void;
}
export interface IGeocodeApiThreeDotZeroOneOptions {
  version: 3.01;
  apiKey: string;
  parsed?: boolean;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: number;
  census?: boolean;
  includeHeader?: boolean;
  notStore?: boolean;
}

export interface IGeocodeApiFourDotZeroOneOptions extends Omit<IGeocodeApiThreeDotZeroOneOptions, 'version'> {
  version: 4.01;
  tieBreakingStrategy?: 'flipACoin' | 'revertToHierarchy';
  censusYear?: Array<'1990' | '2000' | '2010' | 'allAvailable'>;
  format?: 'csv' | 'tsv' | 'xml' | 'json';
}

export interface IAdvancedGeocodeApiFourDotZeroOneOptions extends IGeocodeApiFourDotZeroOneOptions {
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

export type IGeocodingOptions =
  | IGeocodeApiThreeDotZeroOneOptions
  | IGeocodeApiFourDotZeroOneOptions
  | IAdvancedGeocodeApiFourDotZeroOneOptions;

export interface GeocodeResultMetadata {
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

export interface GeocodeResultInputAddress {
  StreetAddress: string;
  City: string;
  State: string;
  Zip: string;
}

export interface GeocodeResultOutputGeocode {
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

export interface GeocodeResult extends GeocodeResultMetadata {
  InputAddress: GeocodeResultInputAddress;
  OutputGeocodes: Array<GeocodeResultOutputGeocode>;
}
