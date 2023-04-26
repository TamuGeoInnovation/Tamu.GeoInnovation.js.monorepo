// This is a series of objects in key-pair values that are used in the application
// to populate dropdowns and other UI elements.

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

export const ADDRESS_FORMAT_TYPES = [
  {
    name: 'USPS Publication 28',
    value: 'USPSPublication28'
  },
  {
    name: 'US Census Tiger',
    value: 'USCensusTiger'
  },
  {
    name: 'LA County',
    value: 'LACounty'
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

export const GEOCODE_INPUT_PARAMS = {
  streetAddress: 'Street address',
  city: 'City',
  state: 'State',
  zip: 'Zip',
  apiKey: 'API Key',
  dontStoreTransactionDetails: 'Store transaction details',
  allowTies: 'Allow ties',
  tieHandlingStrategyType: 'Tie handling strategy type',
  relaxation: 'Use attribute relaxation',
  relaxableAttributes: 'Relaxable attributes',
  substring: 'Use substring matching',
  soundex: 'Use soundex matching',
  soundexAttributes: 'Soundex attributes',
  featureMatchingSelectionMethod: 'Feature matching selection method',
  minimumMatchScore: 'Minimum match score',
  confidenceLevels: 'Confidence levels',
  exhaustiveSearch: 'Exhaustive search',
  aliasTables: 'Alias tables',
  multiThreading: 'Multi-threading',
  includeHeader: 'Include header',
  verbose: 'Verbose',
  outputCensusVariables: 'Output census variables',
  outputReferenceFeatureGeometry: 'Output reference feature geometry',
  outputFormat: 'Output format',
  censusYears: 'Census years',
  referenceSources: 'Reference sources'
};

export const ADDRESS_PROCESSING_PARSED_ADDRESS = {
  addressLocationType: 'Address location type',
  addressFormatType: 'Address format type',
  number: 'Number',
  numberFractional: 'Number fractional',
  preDirectional: 'Pre-directional',
  preQualifier: 'Pre-qualifier',
  preType: 'Pre-type',
  preArticle: 'Pre-article',
  name: 'Name',
  postArticle: 'Post-article',
  postQualifier: 'Post-qualifier',
  postDirectional: 'Post-directional',
  suffix: 'Suffix',
  suiteType: 'Suite type',
  suiteNumber: 'Suite number',
  city: 'City',
  minorCivilDivision: 'Minor civil division',
  consolidatedCity: 'Consolidated city',
  countySubRegion: 'County sub-region',
  county: 'County',
  state: 'State',
  zip: 'Zip',
  zipPlus1: 'Zip+1',
  zipPlus2: 'Zip+2',
  zipPlus3: 'Zip+3',
  zipPlus4: 'Zip+4',
  zipPlus5: 'Zip+5',
  country: 'Country'
};
