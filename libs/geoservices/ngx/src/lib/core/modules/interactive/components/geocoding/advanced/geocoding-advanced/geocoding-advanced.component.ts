import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import { IGeocodeOptions } from '@tamu-gisc/geoprocessing-v5';

import { GeocodingBasicComponent } from '../../basic/geocoding-basic/geocoding-basic.component';
import {
  GEOCODING_REFS,
  OPEN_ADDRESSES_MINIMUM_CONFIDENCE_LEVELS,
  TIE_BREAKING_STRATEGIES
} from '../../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-geocoding-advanced',
  templateUrl: './geocoding-advanced.component.html',
  styleUrls: ['./geocoding-advanced.component.scss']
})
export class GeocodingAdvancedComponent extends GeocodingBasicComponent {
  public tieBreakingStrategies = TIE_BREAKING_STRATEGIES;
  public refs = GEOCODING_REFS;
  public cls = OPEN_ADDRESSES_MINIMUM_CONFIDENCE_LEVELS;

  constructor(
    private fbb: FormBuilder,
    private readonly rtt: Router,
    private readonly arr: ActivatedRoute,
    private readonly lss: LocalStoreService
  ) {
    super(fbb, rtt, arr, lss);
  }

  public override buildForm() {
    // Transform the full list of refs into a list of controls for the form.
    const rfs_controls = [
      ...this.refs.addressPoints,
      ...this.refs.buildingFootprints,
      ...this.refs.parcels,
      ...this.refs.streets,
      ...this.refs.census2020,
      ...this.refs.census2010,
      ...this.refs.census2000,
      ...this.refs.zip
    ].reduce((acc, ref) => {
      acc[ref.value] = [false];

      return acc;
    }, {});

    return this.fbb.group({
      streetAddress: [null, [Validators.required]],
      city: [null, [Validators.required]],
      state: [null, [Validators.required]],
      zip: [null, [Validators.required]],
      censusYears: [[2020], [Validators.required]],
      attributeRelaxation: [true],
      substringMatching: [true],
      soundexMatching: [true],
      uncertaintyHierarchy: [false],
      allowTies: [false],
      tieBreakingStrategy: ['ChooseFirstOne'],
      refs: this.fbb.group({ ...rfs_controls, openAddressesMinimumConfLevel: [5] })
    });
  }

  public override getQueryParameters(): IGeocodeOptions {
    const form = this.form.getRawValue();

    return {
      apiKey: 'demo',
      streetAddress: form.streetAddress,
      city: form.city,
      state: form.state,
      zip: form.zip,
      censusYears: form.censusYears === 'allAvailable' ? 'allAvailable' : [form.censusYears],
      attributeRelaxation: form.attributeRelaxation,
      substringMAtching: form.substringMatching,
      soundex: form.soundexMatching,
      hierarchy: form.uncertaintyHierarchy,
      allowTies: form.allowTies,
      tieBreakingStrategy: form.tieBreakingStrategy,
      confidenceLevels: form.refs.openAddressesMinimumConfLevel,
      // for form refs, return an array for keys for which the value is true
      refs: Object.keys(form.refs).filter((key) => form.refs[key] === true) as unknown as IGeocodeOptions['refs']
    };
  }
}
