import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { skip, startWith, Subject, takeUntil, combineLatest } from 'rxjs';

import { TierCategory } from '@tamu-gisc/geoservices/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { AdminTierFormService } from '../../services/admin-tier-form/admin-tier-form.service';

@Component({
  selector: 'tamu-gisc-tier-category-add-edit-form',
  templateUrl: './tier-category-add-edit-form.component.html',
  styleUrls: ['./tier-category-add-edit-form.component.scss']
})
export class TierCategoryAddEditFormComponent implements OnInit, OnDestroy {
  @Input()
  public category: FormGroup;

  @Output()
  public categoryDelete: EventEmitter<TierCategory> = new EventEmitter<TierCategory>();

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly modalService: ModalService,
    private readonly ats: AdminTierFormService
  ) {}

  public ngOnInit(): void {
    this.setupCategoryIdAutoGeneration();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Sets up automatic generation of category ID based on tier name and category name changes
   */
  private setupCategoryIdAutoGeneration(): void {
    if (!this.category) {
      return;
    }

    // Get the tier name control from the parent form (via AdminTierService)
    const tierNameControl = this.ats.form.get('name');
    const categoryNameControl = this.category.get('name');

    if (tierNameControl && categoryNameControl) {
      // Combine changes from both tier name and category name
      combineLatest([
        tierNameControl.valueChanges.pipe(startWith(tierNameControl.value)),
        categoryNameControl.valueChanges.pipe(startWith(categoryNameControl.value))
      ])
        .pipe(
          skip(1), // Skip the first emission to avoid setting the ID on initial load. This ensures that the ID is only set when the user starts interacting with the form.
          takeUntil(this.destroy$)
        )
        .subscribe(([tierName, categoryName]) => {
          const generatedId = this.ats.generateProductId([tierName ?? '', categoryName ?? '']);
          this.category.get('categoryId')?.setValue(generatedId, { emitEvent: false });
        });
    }
  }

  public get benefitsArray(): FormArray {
    return this.ats.getCategoryBenefitsArray(this.category);
  }

  // Getter for typed category controls
  public get benefitControls(): FormGroup[] {
    return this.benefitsArray.controls as FormGroup[];
  }

  public addBenefit(): void {
    const benefitsArray = this.benefitsArray;
    const newBenefit = this.ats.createBenefitFormGroup(undefined, benefitsArray.length);

    benefitsArray.push(newBenefit);
  }

  public deleteCategory(): void {
    const categoryName = this.category.get('name')?.value || 'this category';

    this.modalService
      .open<Record<string, never>, boolean>({
        title: 'Delete Category',
        subTitle: `Are you sure you want to delete "${categoryName}"?`,
        body: 'This action will remove the category and all its benefits. Changes will be applied upon saving the tier',
        actions: {
          buttons: [
            {
              label: 'No, keep it',
              value: false,
              style: 'secondary'
            },
            {
              label: 'Yes, delete it',
              value: true,
              style: 'danger'
            }
          ]
        }
      })
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.categoryDelete.emit(this.category.value);
        }
      });
  }

  public calculateBenefitOrder(): void {
    this.ats.calculateControlArrayOrder(this.benefitsArray.controls);
  }

  public removeBenefit(category: FormGroup, benefitIndex: number): void {
    this.ats.removeBenefit(category, benefitIndex);
  }
}
