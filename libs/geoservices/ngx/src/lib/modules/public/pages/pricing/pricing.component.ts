import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { combineLatest, map, Observable, shareReplay, startWith, tap } from 'rxjs';

@Component({
  selector: 'tamu-gisc-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  public form: FormGroup;

  public selectedCreditTier: Observable<PricingTier>;
  public selectedCreditTierPoints: Observable<string>;
  public selectedTierCost: Observable<number>;

  public isRecurring: Observable<boolean>;
  public isSLA: Observable<boolean>;
  public partnerPricing: Observable<boolean>;
  public recurringInterval: Observable<IntervalOption>;

  public recurringIntervalOptions = [
    { value: 0, label: 'Monthly', unit: 'mo' },
    { value: 1, label: 'Every three months', unit: '3 mos' },
    { value: 2, label: 'Every six months', unit: '6 mos' },
    { value: 3, label: 'Every twelve months', unit: 'yr' }
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

  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      creditCount: [500],
      isRecurring: [false],
      recurringInterval: [0],
      partnerProgram: [false],
      sla: [false]
    });

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

    this.isRecurring = this.form.get('isRecurring').valueChanges.pipe(
      startWith(this.form.get('isRecurring').value),
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

    this.recurringInterval = this.form.get('recurringInterval').valueChanges.pipe(
      startWith(this.form.get('recurringInterval').value),
      map((interval) => {
        return this.recurringIntervalOptions.find((opt) => opt.value === interval);
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
      startWith(this.form.get('sla')),
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
  value: number;
  label: string;
  unit: string;
}

