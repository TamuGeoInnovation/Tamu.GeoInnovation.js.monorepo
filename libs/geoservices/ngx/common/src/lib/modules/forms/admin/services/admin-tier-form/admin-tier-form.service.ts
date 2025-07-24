import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { Tier, TierBenefit, TierCategory } from '@tamu-gisc/geoservices/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Injectable({
  providedIn: 'root'
})
export class AdminTierFormService {
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
      }
    }
  }

  public createCategoryFormGroup(categoryData?: Partial<TierCategory>, atIndex?: number): FormGroup {
    const defaultCategoryName = categoryData?.name ?? 'New Category' ?? null;
    const defaultCategoryId =
      categoryData?.categoryId ??
      this.generateProductId([this.form.get('name')?.value ?? 'tier', defaultCategoryName, Date.now().toString()]);

    const categoryGroup = this.fb.group({
      id: [{ value: categoryData?.id || null, disabled: true }],
      categoryId: [{ value: defaultCategoryId, disabled: true }, [Validators.required, Validators.maxLength(50)]],
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
        benefitsArray.insert(index, this.createBenefitFormGroup(categoryGroup, { ...benefit, order: index }));
      });
    }

    return categoryGroup;
  }

  public createBenefitFormGroup(categoryData?: FormGroup, benefitData?: Partial<TierBenefit>, atIndex?: number): FormGroup {
    const defaultBenefitName = benefitData?.name ?? 'New Benefit' ?? null;
    const defaultBenefitId =
      benefitData?.benefitId ??
      this.generateProductId([
        this.form.get('name')?.value ?? 'tier',
        categoryData?.get('name')?.value ?? 'category',
        defaultBenefitName,
        Date.now().toString()
      ]);

    return this.fb.group({
      id: [{ value: benefitData?.id || null, disabled: true }],
      benefitId: [{ value: defaultBenefitId, disabled: true }, [Validators.required, Validators.maxLength(50)]],
      active: [benefitData?.active !== undefined ? benefitData.active : true, Validators.required],
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

  public deleteCategory(index: number): void {
    const categories = this.categoriesArray;
    categories.removeAt(index);

    this.calculateControlArrayOrder(categories.controls);
  }

  public getCategoryFormGroup(index: number): FormGroup {
    return this.categoriesArray.at(index) as FormGroup;
  }

  // Benefit management methods
  public getCategoryBenefitsArray(categoryControl: FormGroup): FormArray;
  public getCategoryBenefitsArray(categoryIndex: number): FormArray;
  public getCategoryBenefitsArray(categoryOrIndex: FormGroup | number): FormArray {
    if (categoryOrIndex instanceof FormGroup) {
      return categoryOrIndex.get('benefits') as FormArray;
    }

    // Assumed categoryOrIndex is a number at this point

    return this.getCategoryFormGroup(categoryOrIndex).get('benefits') as FormArray;
  }

  public removeBenefit(category: AbstractControl | FormGroup, benefitIndex: number): void {
    const benefitsArray = category.get('benefits') as FormArray;
    benefitsArray.removeAt(benefitIndex);

    this.calculateControlArrayOrder(benefitsArray.controls);
  }

  public calculateControlArrayOrder(controlArray: Array<AbstractControl | FormControl>): void {
    controlArray.forEach((control, index) => {
      control.get('order')?.setValue(index);
    });
  }

  /**
   * Generates a product lower-cased, hyphen-concatenated ID based on an array of strings.
   *
   * @param {Array<string>} strings - The array of strings to generate the ID from.
   * @memberof AdminTierService
   */
  public generateProductId(strings: Array<string>): string {
    const cleanedStrings = strings.map((str) => str.toLowerCase().trim().replace(/\s+/g, '-'));

    return cleanedStrings.join('-');
  }
}
