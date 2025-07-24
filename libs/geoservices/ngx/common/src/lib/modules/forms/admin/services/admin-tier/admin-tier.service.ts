import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { Tier, TierBenefit, TierCategory } from '@tamu-gisc/geoservices/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Injectable({
  providedIn: 'root'
})
export class AdminTierService {
  public form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly ns: NotificationService,
    private readonly ms: ModalService
  ) {
    this.form = this.fb.group({
      id: [null],
      tierId: [null, [Validators.required, Validators.maxLength(50)]],
      name: [null, [Validators.required, Validators.maxLength(255)]],
      description: [null],
      active: [true, Validators.required],
      categories: this.fb.array([])
    });
  }

  public patchFormWithEntity(entity: Tier): void {
    if (entity) {
      this.form.patchValue({
        id: entity.id,
        tierId: entity.tierId,
        name: entity.name,
        description: entity.description,
        active: entity.active
      });

      // Populate categories if they exist
      if (entity.categories && entity.categories.length > 0) {
        const categoriesArray = this.form.get('categories') as FormArray;

        entity.categories.forEach((category, index) => {
          categoriesArray.insert(index, this.createCategoryFormGroup({ ...category, order: index }));
        });

        console.log(categoriesArray);
      }
    }
  }

  public createCategoryFormGroup(categoryData?: Partial<TierCategory>, atIndex?: number): FormGroup {
    const defaultCategoryName = categoryData?.name ?? 'New Category' ?? null;
    const defaultCategoryId =
      categoryData?.categoryId ?? `${defaultCategoryName.toLowerCase().split(' ').join('-')}-${Date.now()}` ?? null;

    const categoryGroup = this.fb.group({
      id: [{ value: categoryData?.id || null, disabled: true }],
      categoryId: [{ value: defaultCategoryId, disabled: false }, [Validators.required, Validators.maxLength(50)]],
      name: [defaultCategoryName, [Validators.required, Validators.maxLength(255)]],
      description: [categoryData?.description || null],
      order: [{ value: categoryData?.order ?? atIndex ?? 0, disabled: true }, [Validators.required, Validators.min(0)]],
      active: [categoryData?.active !== undefined ? categoryData.active : true, Validators.required],
      benefits: this.fb.array([])
    });

    // Populate benefits if they exist
    if (categoryData?.benefits && categoryData.benefits.length > 0) {
      const benefitsArray = categoryGroup.get('benefits') as FormArray;

      categoryData.benefits.forEach((benefit, index) => {
        benefitsArray.insert(index, this.createBenefitFormGroup({ ...benefit, order: index }));
      });
    }

    return categoryGroup;
  }

  public createBenefitFormGroup(benefitData?: Partial<TierBenefit>, atIndex?: number): FormGroup {
    const defaultBenefitName = benefitData?.name ?? 'New Benefit' ?? null;
    const defaultBenefitId = (benefitData?.benefitId || `${defaultBenefitName.toLowerCase().split(' ').join('-')}`) ?? null;

    return this.fb.group({
      id: [{ value: benefitData?.id || null, disabled: true }],
      active: [benefitData?.active !== undefined ? benefitData.active : true, Validators.required],
      benefitId: [{ value: defaultBenefitId, disabled: false }, [Validators.required, Validators.maxLength(50)]],
      name: [defaultBenefitName, [Validators.required, Validators.maxLength(255)]],
      description: [benefitData?.description || null],
      valueType: [benefitData?.valueType || 'text', Validators.required],
      value: [benefitData?.value || null],
      valueLabel: [benefitData?.valueLabel || null],
      unit: [benefitData?.unit || null],
      showcase: [benefitData?.showcase || false],
      order: [{ value: benefitData?.order ?? atIndex ?? 0, disabled: true }, [Validators.required, Validators.min(0)]]
    });
  }

  public markFormGroupTouched() {
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);

      if (control instanceof FormArray) {
        // Mark form array and all its controls as touched
        control.markAsTouched();
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouchedRecursive(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  public markFormGroupTouchedRecursive(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);

      if (control instanceof FormArray) {
        control.markAsTouched();
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouchedRecursive(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else if (control instanceof FormGroup) {
        this.markFormGroupTouchedRecursive(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Getter for categories form array
  public get categoriesArray(): FormArray {
    return this.form.get('categories') as FormArray;
  }

  public addCategory(): void {
    this.categoriesArray.push(this.createCategoryFormGroup(undefined, this.categoriesArray.length));
  }

  public removeCategory(index: number): void {
    this.categoriesArray.removeAt(index);
  }

  public deleteCategory(index: number): void {
    const categoryName = this.getCategoryFormGroup(index).get('name')?.value || 'this category';

    this.ms
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
          this.removeCategory(index);
        }
      });
  }

  public getCategoryFormGroup(index: number): FormGroup {
    return this.categoriesArray.at(index) as FormGroup;
  }

  // Benefit management methods
  public getBenefitsArray(categoryIndex: number): FormArray {
    return this.getCategoryFormGroup(categoryIndex).get('benefits') as FormArray;
  }

  public removeBenefit(category: AbstractControl | FormGroup, benefitIndex: number): void {
    const benefitsArray = category.get('benefits') as FormArray;
    benefitsArray.removeAt(benefitIndex);
  }

  public getBenefitFormGroup(categoryIndex: number, benefitIndex: number): FormGroup {
    return this.getBenefitsArray(categoryIndex).at(benefitIndex) as FormGroup;
  }

  public calculateControlArrayOrder(controlArray: Array<AbstractControl | FormControl>): void {
    controlArray.forEach((control, index) => {
      control.get('order')?.setValue(index);
    });
  }
}
