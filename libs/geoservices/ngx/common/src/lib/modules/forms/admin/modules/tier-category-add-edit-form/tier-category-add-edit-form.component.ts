import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TierBenefit, TierCategory } from '@tamu-gisc/geoservices/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { AdminTierService } from '../../services/admin-tier/admin-tier.service';

@Component({
  selector: 'tamu-gisc-tier-category-add-edit-form',
  templateUrl: './tier-category-add-edit-form.component.html',
  styleUrls: ['./tier-category-add-edit-form.component.scss']
})
export class TierCategoryAddEditFormComponent implements OnInit {
  @Input()
  public category: FormGroup;

  @Input()
  public formMode: 'create' | 'edit' = 'create';

  @Output()
  public categoryDelete: EventEmitter<TierCategory> = new EventEmitter<TierCategory>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly modalService: ModalService,
    private readonly ats: AdminTierService
  ) {}

  public ngOnInit(): void {
    console.log('TierCategoryAddEditFormComponent initialized with form mode:', this.formMode);
  }

  public getBenefitsArray(): FormArray {
    return this.category.get('benefits') as FormArray;
  }

  public addBenefit(): void {
    const benefitsArray = this.getBenefitsArray();
    const newBenefit = this._createBenefitFormGroup(undefined, benefitsArray.length);

    benefitsArray.push(newBenefit);
  }

  // Getter for typed category controls
  public get benefitControls(): FormGroup[] {
    return this.getBenefitsArray().controls as FormGroup[];
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
    this.ats.calculateControlArrayOrder(this.getBenefitsArray().controls);
  }

  public removeBenefit(category: FormGroup, benefitIndex: number): void {
    this.ats.removeBenefit(category, benefitIndex);
  }

  private _createBenefitFormGroup(benefitData?: Partial<TierBenefit>, atIndex?: number): FormGroup {
    const defaultBenefitName = benefitData?.name ?? 'New Benefit' ?? null;
    const defaultBenefitId = (benefitData?.benefitId || `${defaultBenefitName.toLowerCase().split(' ').join('-')}`) ?? null;

    return this.fb.group({
      id: [{ value: benefitData?.id || null, disabled: true }],
      benefitId: [{ value: defaultBenefitId, disabled: false }, [Validators.required, Validators.maxLength(50)]],
      name: [defaultBenefitName, [Validators.required, Validators.maxLength(255)]],
      description: [benefitData?.description || null],
      value: [benefitData?.value || null, [Validators.maxLength(255)]],
      valueType: [benefitData?.valueType || null, [Validators.maxLength(255)]],
      valueLabel: [benefitData?.valueLabel || null, [Validators.maxLength(255)]],
      unit: [benefitData?.unit || null, [Validators.maxLength(255)]],
      showcase: [benefitData?.showcase !== undefined ? benefitData.showcase : false, Validators.required],
      order: [{ value: benefitData?.order ?? atIndex ?? 0, disabled: true }, [Validators.required, Validators.min(0)]],
      active: [benefitData?.active !== undefined ? benefitData.active : true, Validators.required]
    });
  }
}
