import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, shareReplay, startWith, tap, withLatestFrom } from 'rxjs';

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
      oneTimeCost: 10,
      recurringCost: 10
    },
    {
      points: 1000,
      oneTimeCost: 15,
      recurringCost: 15
    },
    {
      points: 2500,
      oneTimeCost: null,
      recurringCost: null,
      visible: false
    },
    {
      points: 5000,
      oneTimeCost: 25,
      recurringCost: 25
    },
    {
      points: 10000,
      oneTimeCost: 35,
      recurringCost: 35
    },
    {
      points: 25000,
      oneTimeCost: 60,
      recurringCost: null
    },
    {
      points: 50000,
      oneTimeCost: 100,
      recurringCost: null
    },
    {
      points: 100000,
      oneTimeCost: 175,
      recurringCost: 175
    },
    {
      points: 250000,
      oneTimeCost: 375,
      recurringCost: 375
    },
    {
      points: 500000,
      oneTimeCost: 700,
      recurringCost: 700
    },
    {
      points: 1000000,
      oneTimeCost: 1200,
      recurringCost: 10000,
      recurringUnlimited: true
    }
  ];

  constructor(private readonly fb: FormBuilder, private readonly route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      creditCount: [500],
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

    this.selectedCreditTier = this.form.get('creditCount').valueChanges.pipe(
      startWith(this.form.get('creditCount').value),

      map((count) => {
        return this._pricingMatrix.reduce((lastTier, pricingTier) => {
          if (count >= pricingTier.points && pricingTier.visible !== false) {
            return pricingTier;
          } else {
            return lastTier;
          }
        });
      }),
      shareReplay()
    );

    this.frequencyType = this.form.get('frequency').valueChanges.pipe(startWith(this.form.get('frequency').value));

    this.isRecurring = this.frequencyType.pipe(
      map((frequency) => {
        return frequency === FREQUENCY.RECURRING_MONTHLY || frequency === FREQUENCY.RECURRING_YEARLY;
      }),
      tap((recurring) => {
        if (recurring) {
          this.form.patchValue({
            partnerProgram: false
          });
        } else {
          this.form.patchValue({
            sla: false
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

    this.selectedCreditTierPoints = combineLatest([this.selectedCreditTier, this.isRecurring]).pipe(
      map(([tier, recurring]) => {
        if (recurring) {
          if (tier.recurringUnlimited) {
            return 'Unlimited';
          } else {
            return tier.points.toLocaleString();
          }
        } else {
          return tier.points.toLocaleString();
        }
      })
    );

    this.selectedTierCost = combineLatest([this.selectedCreditTier, this.isRecurring, this.partnerPricing]).pipe(
      map(([tier, recurring, partnerPricing]) => {
        if (partnerPricing) {
          return 0;
        }

        if (recurring) {
          return tier.recurringCost;
        } else {
          return tier.oneTimeCost;
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
  }
}

interface PricingTier {
  points: number;
  oneTimeCost: number;
  visible?: boolean;
  recurringCost: number | null;
  recurringUnlimited?: boolean;
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
