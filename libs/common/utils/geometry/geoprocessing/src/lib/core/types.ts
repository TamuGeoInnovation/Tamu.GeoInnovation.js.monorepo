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
