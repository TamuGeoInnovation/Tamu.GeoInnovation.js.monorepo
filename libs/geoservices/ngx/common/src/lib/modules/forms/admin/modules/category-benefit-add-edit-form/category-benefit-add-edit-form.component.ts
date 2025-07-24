import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { skip, startWith, Subject, takeUntil, combineLatest } from 'rxjs';

import { TierBenefit } from '@tamu-gisc/geoservices/data-api';

import { AdminTierFormService } from '../../services/admin-tier-form/admin-tier-form.service';

@Component({
  selector: 'tamu-gisc-category-benefit-add-edit-form',
  templateUrl: './category-benefit-add-edit-form.component.html',
  styleUrls: ['./category-benefit-add-edit-form.component.scss']
})
export class CategoryBenefitAddEditFormComponent implements OnInit, OnDestroy {
  @Input()
  public benefit: FormGroup;

  @Input()
  public category: FormGroup;

  @Output()
  public benefitDelete: EventEmitter<TierBenefit> = new EventEmitter<TierBenefit>();

  private readonly destroy$ = new Subject<void>();

  public benefitValueTypes = [
    { label: 'Numeric', value: 'numeric' },
    { label: 'Boolean', value: 'boolean' },
    { label: 'String', value: 'string' }
  ];

  constructor(private readonly ats: AdminTierFormService) {}

  public ngOnInit(): void {
    this.setupBenefitIdAutoGeneration();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Sets up automatic generation of benefit ID based on tier name, category name, and benefit name changes
   */
  private setupBenefitIdAutoGeneration(): void {
    if (!this.benefit || !this.category) {
      return;
    }

    // Get the tier name control from the parent form (via AdminTierService)
    const tierNameControl = this.ats.form.get('name');
    const categoryNameControl = this.category.get('name');
    const benefitNameControl = this.benefit.get('name');

    if (tierNameControl && categoryNameControl && benefitNameControl) {
      // Combine changes from tier name, category name, and benefit name
      combineLatest([
        tierNameControl.valueChanges.pipe(startWith(tierNameControl.value)),
        categoryNameControl.valueChanges.pipe(startWith(categoryNameControl.value)),
        benefitNameControl.valueChanges.pipe(startWith(benefitNameControl.value))
      ])
        .pipe(
          skip(1), // Skip the first emission to avoid setting the ID on initial load
          takeUntil(this.destroy$)
        )
        .subscribe(([tierName, categoryName, benefitName]) => {
          if (tierName && categoryName && benefitName) {
            const generatedId = this.ats.generateProductId([tierName, categoryName, benefitName]);
            this.benefit.get('benefitId')?.setValue(generatedId, { emitEvent: false });
          }
        });
    }
  }

  public removeBenefit(): void {
    this.benefitDelete.emit(this.benefit.value);
  }
}
