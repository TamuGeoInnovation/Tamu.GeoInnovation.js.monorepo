import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, map, shareReplay, startWith, tap, withLatestFrom } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { RangeInputDataMap } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-interactive-pricing',
  templateUrl: './interactive-pricing.component.html',
  styleUrls: ['./interactive-pricing.component.scss']
})
export class InteractivePricingComponent implements OnInit {
  public form: FormGroup;

  public selectedCreditTier: Observable<PricingTier>;
  public selectedCreditTierPoints: Observable<string>;
  public selectedTierCost: Observable<number>;

  public isRecurring: Observable<boolean>;
  public frequencyType: Observable<FREQUENCY>;
  public isSLA: Observable<boolean>;
  public partnerPricing: Observable<boolean>;
  public recurringInterval: Observable<IntervalOption>;
  public ctaText: Observable<string>;
  public ctaLink: Observable<string>;

  public frequencyOptions: Array<IntervalOption> = [
    { value: FREQUENCY.ONE_TIME, label: 'One-time', unit: null },
    { value: FREQUENCY.RECURRING_MONTHLY, label: 'Monthly', unit: 'mo' },
    { value: FREQUENCY.RECURRING_YEARLY, label: 'Yearly', unit: 'yr' }
  ];

  public yesNoOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ];

  private _pricingMatrix: PricingTiers = [
    {
      points: 500,
      frequency: this._getFrequencyCosts(10)
    },
    {
      points: 1000,
      frequency: this._getFrequencyCosts(15)
    },
    {
      points: 5000,
      frequency: this._getFrequencyCosts(25)
    },
    {
      points: 10000,
      frequency: this._getFrequencyCosts(35)
    },
    {
      points: 25000,
      frequency: this._getFrequencyCosts(60)
    },
    {
      points: 50000,
      frequency: this._getFrequencyCosts(100)
    },
    {
      points: 100000,
      frequency: this._getFrequencyCosts(175)
    },
    {
      points: 250000,
      frequency: this._getFrequencyCosts(375)
    },
    {
      points: 500000,
      frequency: this._getFrequencyCosts(700)
    },
    {
      points: 1000000,
      frequency: this._getFrequencyCosts(1200)
    },
    {
      points: 'Unlimited',
      frequency: {
        oneTime: null,
        monthly: null,
        yearly: 15000
      }
    }
  ];

  public eligiblePricingTiers: Observable<Array<PricingTier>>;
  public pricingSliderDataMap: Observable<RangeInputDataMap>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly env: EnvironmentService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      creditCount: [0],
      frequency: [FREQUENCY.ONE_TIME],
      partnerProgram: [false],
      sla: [false]
    });

    const snapParams = this.route.snapshot.queryParams;

    // Allow to create initial pricing model from direct links to this page from other parts of the website.
    if (Object.keys(snapParams).length > 0) {
      const toPatch: { [key: string]: unknown } = {};

      if (snapParams.recurring !== undefined) {
        toPatch.isRecurring = snapParams.recurring === 'true';
      }

      if (snapParams.partner !== undefined) {
        toPatch.partnerProgram = snapParams.partner === 'true';
      }

      if (snapParams.sla !== undefined) {
        toPatch.sla = snapParams.sla === 'true';
      }

      this.form.patchValue(toPatch);
    }

    this.frequencyType = this.form.get('frequency').valueChanges.pipe(
      startWith(this.form.get('frequency').value),
      tap((freq) => {
        if (freq !== FREQUENCY.RECURRING_YEARLY) {
          this.form.patchValue({
            sla: false
          });
        }
      }),
      shareReplay()
    );

    this.isRecurring = this.frequencyType.pipe(
      map((frequency) => {
        return frequency === FREQUENCY.RECURRING_MONTHLY || frequency === FREQUENCY.RECURRING_YEARLY;
      }),
      tap((recurring) => {
        if (recurring) {
          this.form.patchValue({
            partnerProgram: false
          });
        }
      }),
      shareReplay()
    );

    this.recurringInterval = this.frequencyType.pipe(
      map((freq: FREQUENCY) => {
        return this.frequencyOptions.find((opt) => opt.value === freq);
      }),
      shareReplay()
    );

    this.partnerPricing = this.form
      .get('partnerProgram')
      .valueChanges.pipe(startWith(this.form.get('partnerProgram').value), shareReplay());

    this.eligiblePricingTiers = this.frequencyType.pipe(
      map((type) => {
        if (type === FREQUENCY.ONE_TIME) {
          return this._pricingMatrix.filter((tier) => tier.visible !== false && tier.frequency.oneTime !== null);
        } else if (type === FREQUENCY.RECURRING_MONTHLY) {
          return this._pricingMatrix.filter((tier) => tier.visible !== false && tier.frequency.monthly !== null);
        } else if (type === FREQUENCY.RECURRING_YEARLY) {
          return this._pricingMatrix.filter((tier) => tier.visible !== false && tier.frequency.yearly !== null);
        } else {
          return [];
        }
      }),
      shareReplay()
    );

    this.selectedCreditTier = combineLatest([
      this.form.get('creditCount').valueChanges.pipe(startWith(this.form.get('creditCount').value)),
      this.eligiblePricingTiers
    ]).pipe(
      // Put the effects to update the selected credit tier on the next event loop to give the slider
      // time to update the index value, else a reference error will occur.
      debounceTime(0),
      map(([index, tiers]) => {
        return tiers[index];
      }),
      shareReplay()
    );

    this.selectedCreditTierPoints = this.selectedCreditTier.pipe(
      map((tier) => {
        if (typeof tier.points === 'string') {
          return tier.points;
        } else {
          return tier.points.toLocaleString();
        }
      })
    );

    this.selectedTierCost = combineLatest([this.selectedCreditTier, this.isRecurring, this.partnerPricing]).pipe(
      withLatestFrom(this.frequencyType),
      map(([[tier, recurring, partnerPricing], frequency]) => {
        if (partnerPricing) {
          return 0;
        }

        if (recurring) {
          if (frequency === FREQUENCY.RECURRING_MONTHLY) {
            return tier.frequency.monthly;
          } else if (frequency === FREQUENCY.RECURRING_YEARLY) {
            return tier.frequency.yearly;
          }
        } else {
          return tier.frequency.oneTime;
        }
      })
    );

    this.isSLA = this.form.get('sla').valueChanges.pipe(
      startWith(this.form.get('sla').value),
      tap((sla) => {
        if (sla) {
          this.form.patchValue({ partnerProgram: false });
        }
      }),
      shareReplay()
    );

    this.ctaText = combineLatest([this.recurringInterval, this.isSLA]).pipe(
      map(([interval, sla]) => {
        // return text for ech frequency type and special case for when SLA is selected
        if (sla && interval.value === FREQUENCY.RECURRING_YEARLY) {
          return 'Contact Us for SLA Pricing';
        }

        switch (interval.value) {
          case FREQUENCY.ONE_TIME:
            return 'Checkout';
          case FREQUENCY.RECURRING_MONTHLY:
            return 'Subscribe Monthly';
          case FREQUENCY.RECURRING_YEARLY:
            return 'Subscribe Yearly';
        }
      })
    );

    this.ctaLink = combineLatest([this.selectedCreditTier, this.frequencyType]).pipe(
      // Throw away any events that occur within 100ms of each other because we only care about the last event in quick succession
      // due to the fact that selected tier can change before the frequency type has been updated which will cause errors
      // resolving the cta link.
      debounceTime(0),
      map(([tier, frequency]) => {
        const baseUrl = `${this.env.value('accounts_url', false)}/UserServices/Payments/Make`;

        // return link for each frequency type

        switch (frequency) {
          case FREQUENCY.ONE_TIME:
            return `${baseUrl}/SinglePayment.aspx?plan=${tier.points}&cost=${tier.frequency.oneTime}&paymentType=OneTime&billingPeriod=ONETIME`;
          case FREQUENCY.RECURRING_MONTHLY:
            return `${baseUrl}/PaymentPlan.aspx?plan=${tier.points}&cost=${tier.frequency.monthly}&paymentType=Recurring&billingPeriod=MONT`;
          case FREQUENCY.RECURRING_YEARLY:
            return `${baseUrl}/PaymentPlan.aspx?plan=${tier.points}&cost=${tier.frequency.yearly}&paymentType=Recurring&billingPeriod=YEAR`;
        }
      })
    );

    this.pricingSliderDataMap = this.eligiblePricingTiers.pipe(
      map((activeTiers) => {
        return activeTiers.map((tier, index) => {
          return {
            value: index,
            display: tier.points.toLocaleString()
          };
        });
      }),
      shareReplay()
    );
  }

  private _getFrequencyCosts(base: number): PricingTier['frequency'] {
    return {
      oneTime: base,
      monthly: base - base * DISCOUNT_FACTOR.RECURRING_MONTHLY,
      yearly: base * 12 - base * 12 * DISCOUNT_FACTOR.RECURRING_YEARLY
    };
  }
}

interface PricingTier {
  points: number | string;
  visible?: boolean;
  frequency: {
    oneTime: number | null;
    monthly: number | null;
    yearly: number | null;
  };
}

type PricingTiers = Array<PricingTier>;

interface IntervalOption {
  value: string;
  label: string;
  unit: string;
}

enum FREQUENCY {
  ONE_TIME = 'ONE_TIME',
  RECURRING_MONTHLY = 'RECURRING_MONTHLY',
  RECURRING_YEARLY = 'RECURRING_YEARLY'
}

enum DISCOUNT_FACTOR {
  ONE_TIME = 0,
  RECURRING_MONTHLY = 0.05,
  RECURRING_YEARLY = 0.1
}
