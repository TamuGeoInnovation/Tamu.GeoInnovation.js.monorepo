// This is a series of objects in key-pair values that are used in the application
// to populate dropdowns and other UI elements.

import {
  GeocodeInputParamsField,
  GeocodeReferenceFeatureField,
  ParsedAddressRecordField,
  GeocodeTieHandlingStrategyType,
  CensusYear,
  GeocodeReferenceFeature,
  GeocodeConfidenceLevel,
  AddressProcessingAddressFormat,
  CensusIntersectionRecordField,
  ReverseGeocodeRecordField,
  GeocodeRecordField,
  GeocodeNAACCRField
} from '@tamu-gisc/geoprocessing-v5';

export const TIE_BREAKING_STRATEGIES = [
  {
    name: 'Choose first one',
    value: GeocodeTieHandlingStrategyType.ChooseFirstOne
  },
  {
    name: 'Flip a coin',
    value: GeocodeTieHandlingStrategyType.FlipACoin
  },
  {
    name: 'Revert to hierarchy',
    value: GeocodeTieHandlingStrategyType.RevertToHierarchy
  }
];

export const CENSUS_YEARS = [
  {
    name: CensusYear.Census1990,
    value: CensusYear.Census1990
  },
  {
    name: CensusYear.Census2000,
    value: CensusYear.Census2000
  },
  {
    name: CensusYear.Census2010,
    value: CensusYear.Census2010
  },
  {
    name: CensusYear.Census2020,
    value: CensusYear.Census2020
  },
  {
    name: 'All Available',
    value: CensusYear.AllAvailable
  }
];

export enum ADDRESS_FORMAT_TYPE {
  USPS_PUBLICATION_28 = AddressProcessingAddressFormat.USPSPublication28,
  US_CENSUS_TIGER = AddressProcessingAddressFormat.USCensusTiger,
  LA_COUNTY = AddressProcessingAddressFormat.LACounty
}

export const ADDRESS_FORMAT_TYPES = [
  {
    name: 'USPS Publication 28',
    value: ADDRESS_FORMAT_TYPE.USPS_PUBLICATION_28
  },
  {
    name: 'US Census Tiger',
    value: ADDRESS_FORMAT_TYPE.US_CENSUS_TIGER
  },
  {
    name: 'LA County',
    value: ADDRESS_FORMAT_TYPE.LA_COUNTY
  }
];

export const ADDRESS_POINTS_REF = [
  {
    name: 'Open Addresses',
    value: GeocodeReferenceFeature.OpenAddresses
  }
];

export const BUILDING_FOOTPRINTS_REF = [
  {
    name: 'Microsoft Footprints',
    value: GeocodeReferenceFeature.MicrosoftFootprints
  }
];

export const PARCELS_REF = [
  {
    name: 'National Parcel Geometries (US-Wide)',
    value: GeocodeReferenceFeature.BoundarySolutionsParcelCentroids
  },
  {
    name: 'Local Parcel Centroids',
    value: GeocodeReferenceFeature.CountyParcelData
  }
];

export const STREETS_REF = [
  {
    name: 'Census 2010 Tiger Lines',
    value: GeocodeReferenceFeature.Census2010TigerLines
  },
  {
    name: 'Census 2015 Tiger Lines',
    value: GeocodeReferenceFeature.Census2015TigerLines
  },
  {
    name: 'Census 2016 Tiger Lines',
    value: GeocodeReferenceFeature.Census2016TigerLines
  }
];

export const CENSUS_2020_REF = [
  {
    name: 'Census 2020 Places',
    value: GeocodeReferenceFeature.Census2020Places
  },
  {
    name: 'Census 2020 Consolidated Cities',
    value: GeocodeReferenceFeature.Census2020ConsolidatedCities
  },
  {
    name: 'Census 2020 ZCTAs',
    value: GeocodeReferenceFeature.Census2020ZCTAs
  },
  {
    name: 'Census 2020 County Sub Regions',
    value: GeocodeReferenceFeature.Census2020CountySubRegions
  },
  {
    name: 'Census 2020 Counties',
    value: GeocodeReferenceFeature.Census2020Counties
  },
  {
    name: 'Census 2020 States',
    value: GeocodeReferenceFeature.Census2020States
  }
];

export const CENSUS_2010_REF = [
  {
    name: 'Census 2010 Places',
    value: GeocodeReferenceFeature.Census2010Places
  },
  {
    name: 'Census 2010 Consolidated Cities',
    value: GeocodeReferenceFeature.Census2010ConsolidatedCities
  },
  {
    name: 'Census 2010 ZCTAs',
    value: GeocodeReferenceFeature.Census2010ZCTAs
  },
  {
    name: 'Census 2010 County Sub Regions',
    value: GeocodeReferenceFeature.Census2010CountySubRegions
  },
  {
    name: 'Census 2010 Counties',
    value: GeocodeReferenceFeature.Census2010Counties
  },
  {
    name: 'Census 2010 States',
    value: GeocodeReferenceFeature.Census2010States
  }
];

export const CENSUS_2000_REF = [
  {
    name: 'Census 2000 Places',
    value: GeocodeReferenceFeature.Census2000Places
  },
  {
    name: 'Census 2000 Consolidated Cities',
    value: GeocodeReferenceFeature.Census2000ConsolidatedCities
  },
  {
    name: 'Census 2000 ZCTAs',
    value: GeocodeReferenceFeature.Census2000ZCTAs
  },
  {
    name: 'Census 2000 County Sub Regions',
    value: GeocodeReferenceFeature.Census2000CountySubRegions
  },
  {
    name: 'Census 2000 Counties',
    value: GeocodeReferenceFeature.Census2000Counties
  },
  {
    name: 'Census 2000 States',
    value: GeocodeReferenceFeature.Census2000States
  }
];

export const ZIP_REF = [
  {
    name: 'USPS Zip Codes',
    value: GeocodeReferenceFeature.ZipCodeDownloadZips2013
  },
  {
    name: 'USPS Zip+4',
    value: GeocodeReferenceFeature.USPSTigerZipPlus4
  }
];

export const PRE_COMPUTED_POINTS_REF = [
  {
    name: 'Pre-Computed Points',
    value: GeocodeReferenceFeature.PreComputedPoints
  }
];

export const GEOCODING_REFS = {
  addressPoints: ADDRESS_POINTS_REF,
  buildingFootprints: BUILDING_FOOTPRINTS_REF,
  parcels: PARCELS_REF,
  streets: STREETS_REF,
  census2020: CENSUS_2020_REF,
  census2010: CENSUS_2010_REF,
  census2000: CENSUS_2000_REF,
  zip: ZIP_REF,
  preComputedPoints: PRE_COMPUTED_POINTS_REF
};

export const OPEN_ADDRESSES_MINIMUM_CONFIDENCE_LEVELS = [
  {
    name: '1 - .gov sites',
    value: GeocodeConfidenceLevel.DotGovernmentSites
  },
  {
    name: '2 - Gov sites',
    value: GeocodeConfidenceLevel.GovernmentSites
  },
  {
    name: '3 - .us sites',
    value: GeocodeConfidenceLevel.DotEduSites
  },
  {
    name: '4 - City sites',
    value: GeocodeConfidenceLevel.CitySites
  },
  {
    name: '5 - County sites',
    value: GeocodeConfidenceLevel.CountySites
  },
  {
    name: '6 - .edu sites',
    value: GeocodeConfidenceLevel.DotEduSites
  },
  {
    name: '7 - Public sites',
    value: GeocodeConfidenceLevel.PublicSites
  },
  {
    name: '8 - Source not listed',
    value: GeocodeConfidenceLevel.SourceNotLIsted
  }
];

export const GeocodeInputParameterLabel: { [key in GeocodeInputParamsField]: string } = {
  [GeocodeInputParamsField.StreetAddress]: 'Street address',
  [GeocodeInputParamsField.City]: 'City',
  [GeocodeInputParamsField.State]: 'State',
  [GeocodeInputParamsField.Zip]: 'Zip',
  [GeocodeInputParamsField.ApiKey]: 'API Key',
  [GeocodeInputParamsField.DontStoreTransactionDetails]: 'Store transaction details',
  [GeocodeInputParamsField.AllowTies]: 'Allow ties',
  [GeocodeInputParamsField.TieHandlingStrategyType]: 'Tie handling strategy type',
  [GeocodeInputParamsField.Relaxation]: 'Use attribute relaxation',
  [GeocodeInputParamsField.RelaxableAttributes]: 'Relaxable attributes',
  [GeocodeInputParamsField.Substring]: 'Use substring matching',
  [GeocodeInputParamsField.Soundex]: 'Use soundex matching',
  [GeocodeInputParamsField.SoundexAttributes]: 'Soundex attributes',
  [GeocodeInputParamsField.FeatureMatchingSelectionMethod]: 'Feature matching selection method',
  [GeocodeInputParamsField.MinimumMatchScore]: 'Minimum match score',
  [GeocodeInputParamsField.ConfidenceLevels]: 'Confidence levels',
  [GeocodeInputParamsField.ExhaustiveSearch]: 'Exhaustive search',
  [GeocodeInputParamsField.AliasTables]: 'Alias tables',
  [GeocodeInputParamsField.MultiThreading]: 'Multi-threading',
  [GeocodeInputParamsField.IncludeHeader]: 'Include header',
  [GeocodeInputParamsField.Verbose]: 'Verbose',
  [GeocodeInputParamsField.OutputCensusVariables]: 'Output census variables',
  [GeocodeInputParamsField.OutputReferenceFeatureGeometry]: 'Output reference feature geometry',
  [GeocodeInputParamsField.OutputFormat]: 'Output format',
  [GeocodeInputParamsField.CensusYears]: 'Census years',
  [GeocodeInputParamsField.ReferenceSources]: 'Reference sources'
};

export const ParsedAddressFieldLabel: { [key in ParsedAddressRecordField]: string } = {
  [ParsedAddressRecordField.AddressLocationType]: 'Address location type',
  [ParsedAddressRecordField.AddressFormatType]: 'Address format type',
  [ParsedAddressRecordField.Number]: 'Number',
  [ParsedAddressRecordField.NumberFractional]: 'Number fractional',
  [ParsedAddressRecordField.PreDirectional]: 'Pre-directional',
  [ParsedAddressRecordField.PreQualifier]: 'Pre-qualifier',
  [ParsedAddressRecordField.PreType]: 'Pre-type',
  [ParsedAddressRecordField.PreArticle]: 'Pre-article',
  [ParsedAddressRecordField.Name]: 'Name',
  [ParsedAddressRecordField.PostArticle]: 'Post-article',
  [ParsedAddressRecordField.PostQualifier]: 'Post-qualifier',
  [ParsedAddressRecordField.PostDirectional]: 'Post-directional',
  [ParsedAddressRecordField.Suffix]: 'Suffix',
  [ParsedAddressRecordField.SuiteType]: 'Suite type',
  [ParsedAddressRecordField.SuiteNumber]: 'Suite number',
  [ParsedAddressRecordField.City]: 'City',
  [ParsedAddressRecordField.MinorCivilDivision]: 'Minor civil division',
  [ParsedAddressRecordField.ConsolidatedCity]: 'Consolidated city',
  [ParsedAddressRecordField.CountySubRegion]: 'County sub-region',
  [ParsedAddressRecordField.County]: 'County',
  [ParsedAddressRecordField.State]: 'State',
  [ParsedAddressRecordField.Zip]: 'Zip',
  [ParsedAddressRecordField.ZipPlus1]: 'Zip+1',
  [ParsedAddressRecordField.ZipPlus2]: 'Zip+2',
  [ParsedAddressRecordField.ZipPlus3]: 'Zip+3',
  [ParsedAddressRecordField.ZipPlus4]: 'Zip+4',
  [ParsedAddressRecordField.ZipPlus5]: 'Zip+5',
  [ParsedAddressRecordField.Country]: 'Country'
};

export const GeocodeReferenceFeatureLabel: { [key in GeocodeReferenceFeatureField]: string } = {
  [GeocodeReferenceFeatureField.Address]: 'Address',
  [GeocodeReferenceFeatureField.Area]: 'Area',
  [GeocodeReferenceFeatureField.AreaType]: 'Area type',
  [GeocodeReferenceFeatureField.Geometry]: 'Geometry',
  [GeocodeReferenceFeatureField.GeometrySRID]: 'Geometry SRID',
  [GeocodeReferenceFeatureField.Source]: 'Source',
  [GeocodeReferenceFeatureField.Vintage]: 'Vintage',
  [GeocodeReferenceFeatureField.ServerName]: 'Server name',
  [GeocodeReferenceFeatureField.PrimaryIdField]: 'Primary ID field',
  [GeocodeReferenceFeatureField.PrimaryIdValue]: 'Primary ID value',
  [GeocodeReferenceFeatureField.SecondaryIdField]: 'Secondary ID field',
  [GeocodeReferenceFeatureField.SecondaryIdValue]: 'Secondary ID value',
  [GeocodeReferenceFeatureField.InterpolationType]: 'Interpolation type',
  [GeocodeReferenceFeatureField.InterpolationSubType]: 'Interpolation sub-type'
};

export const CensusIntersectionFeatureLabel: { [key in CensusIntersectionRecordField]: string } = {
  [CensusIntersectionRecordField.CensusYear]: 'Census year',
  [CensusIntersectionRecordField.GeoLocationId]: 'Geolocation ID',
  [CensusIntersectionRecordField.CensusBlock]: 'Census block',
  [CensusIntersectionRecordField.CensusBlockGroup]: 'Census block group',
  [CensusIntersectionRecordField.CensusTract]: 'Census tract',
  [CensusIntersectionRecordField.CensusPlaceFips]: 'Census place FIPS',
  [CensusIntersectionRecordField.CensusMcdFips]: 'Census MCD FIPS',
  [CensusIntersectionRecordField.CensusMsaFips]: 'Census MSA FIPS',
  [CensusIntersectionRecordField.CensusMetDivFips]: 'Census metropolitan division FIPS',
  [CensusIntersectionRecordField.CensusCbsaFips]: 'Census CBSA FIPS',
  [CensusIntersectionRecordField.CensusCbsaMicro]: 'Census CBSA Micropolitan',
  [CensusIntersectionRecordField.CensusCountyFips]: 'Census County FIPS',
  [CensusIntersectionRecordField.CensusStateFips]: 'Census State FIPS',
  [CensusIntersectionRecordField.ExceptionOccurred]: 'Exception occurred',
  [CensusIntersectionRecordField.ExceptionMessage]: 'Exception message'
};

export const ReverseGeocodeFieldLabel: { [key in ReverseGeocodeRecordField]: string } = {
  [ReverseGeocodeRecordField.TimeTaken]: 'Time taken',
  [ReverseGeocodeRecordField.ExceptionOccurred]: 'Exception occurred',
  [ReverseGeocodeRecordField.ErrorMessage]: 'Error message',
  [ReverseGeocodeRecordField.Apn]: 'APN',
  [ReverseGeocodeRecordField.StreetAddress]: 'Street address',
  [ReverseGeocodeRecordField.City]: 'City',
  [ReverseGeocodeRecordField.State]: 'State',
  [ReverseGeocodeRecordField.Zip]: 'Zip',
  [ReverseGeocodeRecordField.ZipPlus4]: 'Zip+4'
};

export const GeocodeFieldLabel: { [key in GeocodeRecordField]: string } = {
  [GeocodeRecordField.Latitude]: 'Latitude',
  [GeocodeRecordField.Longitude]: 'Longitude',
  [GeocodeRecordField.MatchType]: 'Match type',
  [GeocodeRecordField.MatchScore]: 'Match score',
  [GeocodeRecordField.GeocodeQualityType]: 'Quality type',
  [GeocodeRecordField.FeatureMatchingGeographyType]: 'Feature matching geography type',
  [GeocodeRecordField.MatchedLocationType]: 'Matched location type',
  [GeocodeRecordField.FeatureMatchingResultType]: 'Feature matching result type',
  [GeocodeRecordField.Naaccr]: 'NAACCR',
  [GeocodeRecordField.QueryStatusCodes]: 'Query status codes',
  [GeocodeRecordField.TieHandlingStrategyType]: 'Tie handling strategy type',
  [GeocodeRecordField.FeatureMatchingSelectionMethod]: 'Feature matching selection method',
  [GeocodeRecordField.CensusRecords]: 'Census records',
  [GeocodeRecordField.MatchedAddress]: 'Matched address',
  [GeocodeRecordField.ReferenceFeature]: 'Reference feature'
};

export const GeocodeNaaccrFieldLabel: { [key in GeocodeNAACCRField]: string } = {
  [GeocodeNAACCRField.GisCoordinateQualityCode]: 'NAACCR GIS Coordinate Quality Code',
  [GeocodeNAACCRField.GisCoordinateQualityType]: 'NAACCR GIS Coordinate Quality Name',
  [GeocodeNAACCRField.CensusTractCertaintyCode]: 'NAACCR Census Tract Certainty Code',
  [GeocodeNAACCRField.CensusTractCertaintyType]: 'NAACCR Census Tract Certainty Name',
  [GeocodeNAACCRField.MicroMatchStatus]: 'Micro Match Status',
  [GeocodeNAACCRField.PenaltyCode]: 'Penalty Code',
  [GeocodeNAACCRField.PenaltyCodeSummary]: 'Penalty Code Summary',
  [GeocodeNAACCRField.PenaltyCodeDetails]: 'Penalty Code Details'
};
