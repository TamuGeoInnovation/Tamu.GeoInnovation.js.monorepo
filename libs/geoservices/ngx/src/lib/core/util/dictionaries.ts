// This is a series of objects in key-pair values that are used in the application
// to populate dropdowns and other UI elements.

import { ParsedAddressField } from '@tamu-gisc/geoprocessing-v5';

export const TIE_BREAKING_STRATEGIES = [
  {
    name: 'Choose first one',
    value: 'ChooseFirstOne'
  },
  {
    name: 'Flip a coin',
    value: 'FlipACoin'
  },
  {
    name: 'Revert to hierarchy',
    value: 'RevertToHierarchy'
  }
];

export const CENSUS_YEARS = [
  {
    name: '1990',
    value: 1990
  },
  {
    name: '2000',
    value: 2000
  },
  {
    name: '2010',
    value: 2010
  },
  {
    name: '2020',
    value: 2020
  },
  {
    name: 'All Available',
    value: 'allAvailable'
  }
];

export enum ADDRESS_FORMAT_TYPE {
  USPS_PUBLICATION_28 = 'USPSPublication28',
  US_CENSUS_TIGER = 'USCensusTiger',
  LA_COUNTY = 'LACounty'
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
    value: 'OpenAddresses'
  }
];

export const BUILDING_FOOTPRINTS_REF = [
  {
    name: 'Microsoft Footprints',
    value: 'MicrosoftFootprints'
  }
];

export const PARCELS_REF = [
  {
    name: 'National Parcel Geometries (US-Wide)',
    value: 'BoundarySolutionsParcelCentroids'
  },
  {
    name: 'Local Parcel Centroids',
    value: 'CountyParcelData'
  }
];

export const STREETS_REF = [
  {
    name: 'Census 2010 Tiger Lines',
    value: 'Census2010TigerLines'
  },
  {
    name: 'Census 2015 Tiger Lines',
    value: 'Census2015TigerLines'
  },
  {
    name: 'Census 2016 Tiger Lines',
    value: 'Census2016TigerLines'
  }
];

export const CENSUS_2020_REF = [
  {
    name: 'Census 2020 Places',
    value: 'Census2020Places'
  },
  {
    name: 'Census 2020 Consolidated Cities',
    value: 'Census2020ConsolidatedCities'
  },
  {
    name: 'Census 2020 ZCTAs',
    value: 'Census2020ZCTAs'
  },
  {
    name: 'Census 2020 County Sub Regions',
    value: 'Census2020CountySubRegions'
  },
  {
    name: 'Census 2020 Counties',
    value: 'Census2020Counties'
  },
  {
    name: 'Census 2020 States',
    value: 'Census2020States'
  }
];

export const CENSUS_2010_REF = [
  {
    name: 'Census 2010 Places',
    value: 'Census2010Places'
  },
  {
    name: 'Census 2010 Consolidated Cities',
    value: 'Census2010ConsolidatedCities'
  },
  {
    name: 'Census 2010 ZCTAs',
    value: 'Census2010ZCTAs'
  },
  {
    name: 'Census 2010 County Sub Regions',
    value: 'Census2010CountySubRegions'
  },
  {
    name: 'Census 2010 Counties',
    value: 'Census2010Counties'
  },
  {
    name: 'Census 2010 States',
    value: 'Census2010States'
  }
];

export const CENSUS_2000_REF = [
  {
    name: 'Census 2000 Places',
    value: 'Census2000Places'
  },
  {
    name: 'Census 2000 Consolidated Cities',
    value: 'Census2000ConsolidatedCities'
  },
  {
    name: 'Census 2000 ZCTAs',
    value: 'Census2000ZCTAs'
  },
  {
    name: 'Census 2000 County Sub Regions',
    value: 'Census2000CountySubRegions'
  },
  {
    name: 'Census 2000 Counties',
    value: 'Census2000Counties'
  },
  {
    name: 'Census 2000 States',
    value: 'Census2000States'
  }
];

export const ZIP_REF = [
  {
    name: 'USPS Zip Codes',
    value: 'ZipCodeDownloadZips2013'
  },
  {
    name: 'USPS Zip+4',
    value: 'USPSTigerZipPlus4'
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
  zip: ZIP_REF
};

export const OPEN_ADDRESSES_MINIMUM_CONFIDENCE_LEVELS = [
  {
    name: '1 - .gov sites',
    value: 1
  },
  {
    name: '2 - Gov sites',
    value: 2
  },
  {
    name: '3 - .us sites',
    value: 3
  },
  {
    name: '4 - City sites',
    value: 4
  },
  {
    name: '5 - County sites',
    value: 5
  },
  {
    name: '6 - .edu sites',
    value: 6
  },
  {
    name: '7 - Public sites',
    value: 7
  },
  {
    name: '8 - Source not listed',
    value: 8
  }
];

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

export const GEOCODE_INPUT_PARAMS: { [key in GeocodeInputParamsField]: string } = {
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

export const ParsedAddressFieldLabel: { [key in ParsedAddressField]: string } = {
  [ParsedAddressField.AddressLocationType]: 'Address location type',
  [ParsedAddressField.AddressFormatType]: 'Address format type',
  [ParsedAddressField.Number]: 'Number',
  [ParsedAddressField.NumberFractional]: 'Number fractional',
  [ParsedAddressField.PreDirectional]: 'Pre-directional',
  [ParsedAddressField.PreQualifier]: 'Pre-qualifier',
  [ParsedAddressField.PreType]: 'Pre-type',
  [ParsedAddressField.PreArticle]: 'Pre-article',
  [ParsedAddressField.Name]: 'Name',
  [ParsedAddressField.PostArticle]: 'Post-article',
  [ParsedAddressField.PostQualifier]: 'Post-qualifier',
  [ParsedAddressField.PostDirectional]: 'Post-directional',
  [ParsedAddressField.Suffix]: 'Suffix',
  [ParsedAddressField.SuiteType]: 'Suite type',
  [ParsedAddressField.SuiteNumber]: 'Suite number',
  [ParsedAddressField.City]: 'City',
  [ParsedAddressField.MinorCivilDivision]: 'Minor civil division',
  [ParsedAddressField.ConsolidatedCity]: 'Consolidated city',
  [ParsedAddressField.CountySubRegion]: 'County sub-region',
  [ParsedAddressField.County]: 'County',
  [ParsedAddressField.State]: 'State',
  [ParsedAddressField.Zip]: 'Zip',
  [ParsedAddressField.ZipPlus1]: 'Zip+1',
  [ParsedAddressField.ZipPlus2]: 'Zip+2',
  [ParsedAddressField.ZipPlus3]: 'Zip+3',
  [ParsedAddressField.ZipPlus4]: 'Zip+4',
  [ParsedAddressField.ZipPlus5]: 'Zip+5',
  [ParsedAddressField.Country]: 'Country'
};

export enum GeocodeReferenceFeatureField {
  Area = 'area',
  AreaType = 'areaType',
  GeometrySRID = 'geometrySRID',
  Source = 'source',
  Vintage = 'vintage',
  PrimaryIdField = 'primaryIdField',
  PrimaryIdValue = 'primaryIdValue',
  SecondaryIdField = 'secondaryIdField',
  SecondaryIdValue = 'secondaryIdValue',
  InterpolationType = 'interpolationType',
  InterpolationSubType = 'interpolationSubType'
}

export const GEOCODE_REFERENCE_FEATURE: { [key in GeocodeReferenceFeatureField]: string } = {
  [GeocodeReferenceFeatureField.Area]: 'Area',
  [GeocodeReferenceFeatureField.AreaType]: 'Area type',
  [GeocodeReferenceFeatureField.GeometrySRID]: 'Geometry SRID',
  [GeocodeReferenceFeatureField.Source]: 'Source',
  [GeocodeReferenceFeatureField.Vintage]: 'Vintage',
  [GeocodeReferenceFeatureField.PrimaryIdField]: 'Primary ID field',
  [GeocodeReferenceFeatureField.PrimaryIdValue]: 'Primary ID value',
  [GeocodeReferenceFeatureField.SecondaryIdField]: 'Secondary ID field',
  [GeocodeReferenceFeatureField.SecondaryIdValue]: 'Secondary ID value',
  [GeocodeReferenceFeatureField.InterpolationType]: 'Interpolation type',
  [GeocodeReferenceFeatureField.InterpolationSubType]: 'Interpolation sub-type'
};

