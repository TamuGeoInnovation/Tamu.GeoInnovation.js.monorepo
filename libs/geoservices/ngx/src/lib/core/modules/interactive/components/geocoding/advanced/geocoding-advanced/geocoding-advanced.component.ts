import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';
import {
  CensusYear,
  GeocodeTieHandlingStrategyType,
  IGeocodeOptions,
  GeocodeConfidenceLevel
} from '@tamu-gisc/geoprocessing-v5';
import { AuthService } from '@tamu-gisc/geoservices/data-access';

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
export class GeocodingAdvancedComponent extends GeocodingBasicComponent implements OnInit, OnDestroy {
  public tieBreakingStrategies = TIE_BREAKING_STRATEGIES;
  public refs = GEOCODING_REFS;
  public cls = OPEN_ADDRESSES_MINIMUM_CONFIDENCE_LEVELS;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private fbb: FormBuilder,
    private readonly rtt: Router,
    private readonly arr: ActivatedRoute,
    private readonly lss: LocalStoreService,
    private readonly ass: AuthService
  ) {
    super(fbb, rtt, arr, lss, ass);
  }

  public ngOnInit(): void {
    super.ngOnInit();

    this.isAdvanced.pipe(takeUntil(this._$destroy)).subscribe((b) => {
      // If form is toggled to basic, handle incompatible data models
      const currentYears = this.form.get('censusYears').value;

      if (b === false) {
        // Will be a number if size is greater than zero.
        // Will be undefined if the size is zero.
        const singleYear = currentYears[currentYears.length - 1];

        // If singleYear is undefined, return null,
        // Otherwise, convert the string to a number, or return the number.
        const asString =
          singleYear === undefined ? null : typeof singleYear === 'number' ? singleYear.toString() : singleYear;

        setTimeout(() => {
          this.form.patchValue({
            censusYears: asString
          });
        }, 0);
      } else {
        this.form.patchValue({
          censusYears: currentYears instanceof Array ? currentYears : [currentYears]
        });
      }
    });
  }

  public ngOnDestroy(): void {
    this._$destroy.next(null);
    this._$destroy.complete();
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
      streetAddress: [null, []],
      city: [null, []],
      state: [null, []],
      zip: [null, []],
      censusYears: [[CensusYear.Census2020], []],
      attributeRelaxation: [true],
      substringMatching: [true],
      soundexMatching: [true],
      uncertaintyHierarchy: [false],
      allowTies: [false],
      tieBreakingStrategy: [GeocodeTieHandlingStrategyType.ChooseFirstOne],
      refs: this.fbb.group({ ...rfs_controls, openAddressesMinimumConfLevel: [GeocodeConfidenceLevel.PublicSites] })
    });
  }

  public override getQueryParameters(): IGeocodeOptions {
    const form = this.form.getRawValue();

    return {
      apiKey: '',
      streetAddress: form.streetAddress,
      city: form.city,
      state: form.state,
      zip: form.zip,
      censusYears: form.censusYears === CensusYear.AllAvailable ? CensusYear.AllAvailable : [form.censusYears],
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
