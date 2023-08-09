// This is a series of objects in key-pair values that are used in the application
// to populate dropdowns and other UI elements.

import {
  GeocodeInputParamsField,
  GeocodeReferenceFeatureField,
  ParsedAddressField,
  GeocodeTieHandlingStrategyType,
  CensusYear,
  GeocodeReferenceFeature,
  GeocodeConfidenceLevel,
  AddressProcessingAddressFormat,
  CensusIntersectionField,
  ReverseGeocodeField
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

export const CensusIntersectionFeatureLabel: { [key in CensusIntersectionField]: string } = {
  [CensusIntersectionField.CensusYear]: 'Census year',
  [CensusIntersectionField.GeoLocationId]: 'Geolocation ID',
  [CensusIntersectionField.CensusBlock]: 'Census block',
  [CensusIntersectionField.CensusBlockGroup]: 'Census block group',
  [CensusIntersectionField.CensusTract]: 'Census tract',
  [CensusIntersectionField.CensusPlaceFips]: 'Census place FIPS',
  [CensusIntersectionField.CensusMcdFips]: 'Census MCD FIPS',
  [CensusIntersectionField.CensusMsaFips]: 'Census MSA FIPS',
  [CensusIntersectionField.CensusMetDivFips]: 'Census metropolitan division FIPS',
  [CensusIntersectionField.CensusCbsaFips]: 'Census CBSA FIPS',
  [CensusIntersectionField.CensusCbsaMicro]: 'Census CBSA Micropolitan',
  [CensusIntersectionField.CensusCountyFips]: 'Census County FIPS',
  [CensusIntersectionField.CensusStateFips]: 'Census State FIPS',
  [CensusIntersectionField.ExceptionOccurred]: 'Exception occurred',
  [CensusIntersectionField.ExceptionMessage]: 'Exception message'
};

export const ReverseGeocodeFieldLabel: { [key in ReverseGeocodeField]: string } = {
  [ReverseGeocodeField.TimeTaken]: 'Time taken',
  [ReverseGeocodeField.ExceptionOccurred]: 'Exception occurred',
  [ReverseGeocodeField.ErrorMessage]: 'Error message',
  [ReverseGeocodeField.Apn]: 'APN',
  [ReverseGeocodeField.StreetAddress]: 'Street address',
  [ReverseGeocodeField.City]: 'City',
  [ReverseGeocodeField.State]: 'State',
  [ReverseGeocodeField.Zip]: 'Zip',
  [ReverseGeocodeField.ZipPlus4]: 'Zip+4'
};
