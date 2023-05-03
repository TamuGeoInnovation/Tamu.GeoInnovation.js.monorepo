import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, pipe, delay, map, switchMap } from 'rxjs';

import { STATES_TITLECASE } from '@tamu-gisc/common/datasets/geographic';
import { Geocode, GeocodeResult, IGeocodeOptions } from '@tamu-gisc/geoprocessing-v5';

import { BaseInteractiveGeoprocessingComponent } from '../../../common/base-interactive-geoprocessing/base-interactive-geoprocessing.component';
import { CENSUS_YEARS } from '../../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-geocoding-basic',
  templateUrl: './geocoding-basic.component.html',
  styleUrls: ['./geocoding-basic.component.scss']
})
export class GeocodingBasicComponent extends BaseInteractiveGeoprocessingComponent<GeocodeResult, IGeocodeOptions> {
  public states = STATES_TITLECASE;
  public censusYears = CENSUS_YEARS;

  constructor(private fb: FormBuilder, private readonly rt: Router, private readonly ar: ActivatedRoute) {
    super(fb, rt, ar);
  }

  public buildForm() {
    return this.fb.group({
      streetAddress: [null, [Validators.required]],
      city: [null, [Validators.required]],
      state: [null, [Validators.required]],
      zip: [null, [Validators.required]],
      censusYears: [null, [Validators.required]]
    });
  }

  public getQuery() {
    return pipe(
      switchMap(() => {
        const params = this.getQueryParameters();

        return of({
          statusCode: 200,
          message: 'Success',
          error: null,
          data: {
            version: {
              major: 5,
              minor: 0,
              build: 0,
              revision: 0,
              majorRevision: 0,
              minorRevision: 0
            },
            timeTaken: 0,
            transactionGuid: '2805ae4a-449a-4838-9b8f-6d0e653ab695',
            apiHost: 'GSVCSAPI5001',
            clientHost: 'geoservices.tamu.edu',
            queryStatusCode: 'Success',
            parsedAddress: null,
            inputParameterSet: {
              streetAddress: '1207 WINDING RD',
              city: 'College Station',
              state: 'TX',
              zip: '77840',
              version: {
                major: 5,
                minor: 0,
                build: 0,
                revision: 0,
                majorRevision: 0,
                minorRevision: 0
              },
              apiKey: 'demo',
              dontStoreTransactionDetails: false,
              allowTies: false,
              tieHandlingStrategyType: 'FlipACoin',
              relaxableAttributes: ['PreDirectional', 'Suffix', 'City', 'Zip'],
              relaxation: true,
              substring: null,
              soundex: true,
              soundexAttributes: 'Name,City',
              referenceSources: ['MicrosoftFootprints'],
              featureMatchingSelectionMethod: null,
              attributeWeightingScheme: {
                number: 20,
                numberParity: 4,
                preDirectional: 7,
                preType: 5,
                preQualifier: 4,
                preArticle: 2,
                name: 45,
                postArticle: 2,
                suffix: 10,
                postDirectional: 4,
                postQualifier: 3,
                city: 17,
                zip: 45,
                zipPlus4: 1,
                state: 1,
                totalWeight: 169
              },
              minimumMatchScore: 88,
              confidenceLevels: 7,
              exhaustiveSearch: false,
              aliasTables: false,
              multiThreading: false,
              censusYears: [1990, 2000, 2010, 2020],
              includeHeader: false,
              verbose: true,
              outputCensusVariables: true,
              outputReferenceFeatureGeometry: false,
              outputFormat: 'json'
            },
            results: [
              {
                latitude: 30.6037245,
                longitude: -96.3226782,
                matchScore: 100,
                geocodeQualityType: 'RoofTop',
                featureMatchingGeographyType: 'BuildingCentroid',
                matchType: 'Exact',
                matchedLocationType: 'StreetAddress',
                featureMatchingResultType: 'Success',
                naaccr: {
                  gisCoordinateQualityCode: '00',
                  gisCoordinateQualityType: 'AddressPoint',
                  censusTractCertaintyCode: '1',
                  censusTractCertaintyType: 'ResidenceStreetAddress',
                  microMatchStatus: 'Match',
                  penaltyCode: 'MMMMMMMMMMMMM0',
                  penaltyCodeSummary: 'MMMMMMMMMMMMMM',
                  penaltyCodeDetails: null
                },
                queryStatusCodes: 'Success',
                tieHandlingStrategyType: 'Unknown',
                featureMatchingSelectionMethod: 'FeatureClassBased',
                censusRecords: [
                  {
                    censusYear: 1990,
                    geoLocationId: '48041001602',
                    censusBlock: null,
                    censusBlockGroup: null,
                    censusTract: '0016.02',
                    censusPlaceFips: null,
                    censusMcdFips: null,
                    censusMsaFips: null,
                    censusMetDivFips: null,
                    censusCbsaFips: null,
                    censusCbsaMicro: null,
                    censusCountyFips: '041',
                    censusStateFips: '48',
                    exceptionOccurred: false,
                    exceptionMessage: null
                  },
                  {
                    censusYear: 2000,
                    geoLocationId: '480410016032',
                    censusBlock: '2009',
                    censusBlockGroup: '2',
                    censusTract: '0016.03',
                    censusPlaceFips: '15976',
                    censusMcdFips: '90495',
                    censusMsaFips: '1260',
                    censusMetDivFips: null,
                    censusCbsaFips: '17780',
                    censusCbsaMicro: '0',
                    censusCountyFips: '041',
                    censusStateFips: '48',
                    exceptionOccurred: false,
                    exceptionMessage: null
                  },
                  {
                    censusYear: 2010,
                    geoLocationId: '480410016061',
                    censusBlock: '1007',
                    censusBlockGroup: '1',
                    censusTract: '0016.06',
                    censusPlaceFips: '15976',
                    censusMcdFips: '90495',
                    censusMsaFips: '1260',
                    censusMetDivFips: null,
                    censusCbsaFips: '17780',
                    censusCbsaMicro: '0',
                    censusCountyFips: '041',
                    censusStateFips: '48',
                    exceptionOccurred: false,
                    exceptionMessage: null
                  },
                  {
                    censusYear: 2020,
                    geoLocationId: '480410016061',
                    censusBlock: '1008',
                    censusBlockGroup: '1',
                    censusTract: '0016.06',
                    censusPlaceFips: '15976',
                    censusMcdFips: '90495',
                    censusMsaFips: '1260',
                    censusMetDivFips: null,
                    censusCbsaFips: '17780',
                    censusCbsaMicro: '0',
                    censusCountyFips: '041',
                    censusStateFips: '48',
                    exceptionOccurred: false,
                    exceptionMessage: null
                  }
                ],
                matchedAddress: {
                  addressLocationType: 'StreetAddress',
                  addressFormatType: 'USPSPublication28',
                  number: '1207',
                  numberFractional: null,
                  preDirectional: null,
                  preQualifier: null,
                  preType: null,
                  preArticle: null,
                  name: 'WINDING',
                  postArticle: null,
                  postQualifier: null,
                  postDirectional: null,
                  suffix: 'RD',
                  suiteType: null,
                  suiteNumber: null,
                  city: 'College Station',
                  minorCivilDivision: null,
                  consolidatedCity: null,
                  countySubRegion: null,
                  county: null,
                  state: 'TX',
                  zip: '77840',
                  zipPlus1: null,
                  zipPlus2: null,
                  zipPlus3: null,
                  zipPlus4: null,
                  zipPlus5: null,
                  country: null
                },
                referenceFeature: {
                  address: {
                    addressLocationType: 'StreetAddress',
                    addressFormatType: 'USPSPublication28',
                    number: '1207',
                    numberFractional: null,
                    preDirectional: '',
                    preQualifier: null,
                    preType: null,
                    preArticle: null,
                    name: 'WINDING',
                    postArticle: null,
                    postQualifier: null,
                    postDirectional: '',
                    suffix: 'RD',
                    suiteType: null,
                    suiteNumber: null,
                    city: 'College Station',
                    minorCivilDivision: null,
                    consolidatedCity: null,
                    countySubRegion: null,
                    county: 'BrazosCad',
                    state: 'TX',
                    zip: '77840',
                    zipPlus1: null,
                    zipPlus2: null,
                    zipPlus3: null,
                    zipPlus4: '',
                    zipPlus5: null,
                    country: null
                  },
                  area: 343.9982034564018,
                  areaType: 'Meters',
                  geometrySRID: null,
                  geometry: null,
                  source: 'MicrosoftFootprints',
                  vintage: 2020,
                  serverName: 'A-MSFTBLDG',
                  primaryIdField: 'footPrintID',
                  primaryIdValue: '5607869',
                  secondaryIdField: 'uniqueId',
                  secondaryIdValue: '451112',
                  interpolationType: 'Unknown',
                  interpolationSubType: 'Unknown'
                }
              }
            ]
          }
        } as GeocodeResult).pipe(delay(1250));

        return new Geocode(params).asObservable().pipe(delay(1250));
      })
    );
  }

  public override getQueryParameters(): IGeocodeOptions {
    const form = this.form.getRawValue();

    return {
      apiKey: 'demo',
      streetAddress: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip,
      censusYears: form.censusYears === 'allAvailable' ? 'allAvailable' : [form.censusYears]
    };
  }

  public getMapPoints() {
    return pipe(
      map((res: GeocodeResult) => {
        // points should be an array of objects with latitude and longitude properties based on res.data.results
        const points = res.data.results.map((result) => {
          return { latitude: result.latitude, longitude: result.longitude };
        });

        return points;
      })
    );
  }
}
