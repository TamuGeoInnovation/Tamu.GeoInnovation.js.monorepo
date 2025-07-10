import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, of, take } from 'rxjs';

import { Tier } from '@tamu-gisc/geoservices/data-api';
import { TiersService } from '@tamu-gisc/geoservices/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-tier-add-edit-form',
  templateUrl: './tier-add-edit-form.component.html',
  styleUrls: ['./tier-add-edit-form.component.scss']
})
export class TierAddEditFormComponent implements OnInit {
  @Input()
  public type: 'create' | 'edit' = 'create';

  @Input()
  public entityId?: number;

  public entity$: Observable<Tier | undefined>;
  public form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly tiersService: TiersService,
    private readonly notificationService: NotificationService,
    private readonly modalService: ModalService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      tierId: [null, [Validators.required, Validators.maxLength(50)]],
      name: [null, [Validators.required, Validators.maxLength(255)]],
      description: [null],
      active: [true, Validators.required],
      categories: this.fb.array([])
    });

    if (this.type === 'edit' && this.entityId) {
      this.entity$ = this.tiersService.getById(this.entityId).pipe(
        catchError((error) => {
          console.error('Error loading tier:', error);
          this.notificationService.toast({
            id: 'tier-load-error',
            title: 'Load Tier',
            message: 'Error loading tier information'
          });
          return of(undefined);
        })
      );

      this.entity$.pipe(take(1)).subscribe((entity) => {
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
            entity.categories.forEach((category) => {
              categoriesArray.push(this._createCategoryFormGroup(category));
            });
          }
        }
      });
    }
  }

  // Getter for categories form array
  public get categoriesArray(): FormArray {
    return this.form.get('categories') as FormArray;
  }

  // Category management methods
  public addCategory(): void {
    this.categoriesArray.push(this._createCategoryFormGroup());
  }

  public removeCategory(index: number): void {
    this.categoriesArray.removeAt(index);
  }

  public getCategoryFormGroup(index: number): FormGroup {
    return this.categoriesArray.at(index) as FormGroup;
  }

  // Convenience method to add a category with a default benefit
  public addCategoryWithBenefit(): void {
    const categoryIndex = this.categoriesArray.length;
    this.addCategory();
    // Add a default benefit to the new category
    this.addBenefit(categoryIndex);
  }

  // Benefit management methods
  public getBenefitsArray(categoryIndex: number): FormArray {
    return this.getCategoryFormGroup(categoryIndex).get('benefits') as FormArray;
  }

  public addBenefit(categoryIndex: number): void {
    const benefitsArray = this.getBenefitsArray(categoryIndex);
    benefitsArray.push(this._createBenefitFormGroup());
  }

  public removeBenefit(categoryIndex: number, benefitIndex: number): void {
    const benefitsArray = this.getBenefitsArray(categoryIndex);
    benefitsArray.removeAt(benefitIndex);
  }

  public getBenefitFormGroup(categoryIndex: number, benefitIndex: number): FormGroup {
    return this.getBenefitsArray(categoryIndex).at(benefitIndex) as FormGroup;
  }

  public handleSubmission() {
    if (this.form.valid) {
      if (this.type === 'create') {
        this._createEntity();
      } else {
        this._updateEntity();
      }
    } else {
      this._markFormGroupTouched();
    }
  }

  public deleteEntity() {
    if (this.entityId && this.type === 'edit') {
      this.modalService
        .open<Record<string, never>, boolean>({
          title: 'Delete Tier',
          subTitle: 'Are you sure you want to delete this tier?',
          body: 'This action is immediate and cannot be undone. Please confirm that you understand the consequences of this action.',
          actions: {
            buttons: [
              {
                label: "No, I've changed my mind",
                value: false,
                style: 'secondary'
              },
              {
                label: 'Yes, I understand',
                value: true,
                style: 'danger'
              }
            ]
          }
        })
        .subscribe((confirmed: boolean) => {
          if (confirmed && this.entityId) {
            this.tiersService.delete(this.entityId).subscribe({
              next: () => {
                this.notificationService.toast({
                  id: 'tier-delete-success',
                  title: 'Delete Tier',
                  message: 'Tier was successfully deleted.'
                });
                this._navigateBack();
              },
              error: (err) => {
                console.error('Error deleting tier:', err);
                this.notificationService.toast({
                  id: 'tier-delete-failed',
                  title: 'Delete Tier',
                  message: `Error deleting tier: ${err.status || 'Unknown error'}`
                });
              }
            });
          }
        });
    }
  }

  private _createEntity() {
    const formValue = this.form.getRawValue();
    delete formValue.id; // Remove id for creation

    this.tiersService.create(formValue).subscribe({
      next: () => {
        this.notificationService.toast({
          id: 'tier-create-success',
          title: 'Create Tier',
          message: 'Tier was successfully created.'
        });
        this._navigateBack();
      },
      error: (err) => {
        console.error('Error creating tier:', err);
        this.notificationService.toast({
          id: 'tier-create-failed',
          title: 'Create Tier',
          message: `Error creating tier: ${err.status || 'Unknown error'}`
        });
      }
    });
  }

  private _updateEntity() {
    const formValue = this.form.getRawValue();

    if (this.entityId) {
      this.tiersService.update(this.entityId, formValue).subscribe({
        next: () => {
          this.notificationService.toast({
            id: 'tier-update-success',
            title: 'Update Tier',
            message: 'Tier was successfully updated.'
          });
          this._navigateBack();
        },
        error: (err) => {
          console.error('Error updating tier:', err);
          this.notificationService.toast({
            id: 'tier-update-failed',
            title: 'Update Tier',
            message: `Error updating tier: ${err.status || 'Unknown error'}`
          });
        }
      });
    }
  }

  private _navigateBack() {
    this.router.navigate(['/admin/tiers']);
  }

  private _markFormGroupTouched() {
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);

      if (control instanceof FormArray) {
        // Mark form array and all its controls as touched
        control.markAsTouched();
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this._markFormGroupTouchedRecursive(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  private _markFormGroupTouchedRecursive(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);

      if (control instanceof FormArray) {
        control.markAsTouched();
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this._markFormGroupTouchedRecursive(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else if (control instanceof FormGroup) {
        this._markFormGroupTouchedRecursive(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  private _createCategoryFormGroup(
    categoryData?: Partial<{
      id: number;
      categoryId: string;
      name: string;
      description: string;
      order: number;
      active: boolean;
      benefits: unknown[];
    }>
  ): FormGroup {
    const categoryGroup = this.fb.group({
      id: [categoryData?.id || null],
      categoryId: [categoryData?.categoryId || null, [Validators.required, Validators.maxLength(50)]],
      name: [categoryData?.name || null, [Validators.required, Validators.maxLength(255)]],
      description: [categoryData?.description || null],
      order: [categoryData?.order || 1, [Validators.required, Validators.min(1)]],
      active: [categoryData?.active !== undefined ? categoryData.active : true, Validators.required],
      benefits: this.fb.array([])
    });

    // Populate benefits if they exist
    if (categoryData?.benefits && categoryData.benefits.length > 0) {
      const benefitsArray = categoryGroup.get('benefits') as FormArray;
      categoryData.benefits.forEach((benefit) => {
        benefitsArray.push(
          this._createBenefitFormGroup(
            benefit as Partial<{
              id: number;
              benefitId: string;
              name: string;
              description: string;
              value: string;
              showcase: boolean;
              order: number;
              active: boolean;
            }>
          )
        );
      });
    }

    return categoryGroup;
  }

  private _createBenefitFormGroup(
    benefitData?: Partial<{
      id: number;
      benefitId: string;
      name: string;
      description: string;
      value: string;
      showcase: boolean;
      order: number;
      active: boolean;
    }>
  ): FormGroup {
    return this.fb.group({
      id: [benefitData?.id || null],
      benefitId: [benefitData?.benefitId || null, [Validators.required, Validators.maxLength(50)]],
      name: [benefitData?.name || null, [Validators.required, Validators.maxLength(255)]],
      description: [benefitData?.description || null],
      value: [benefitData?.value || null, [Validators.maxLength(255)]],
      showcase: [benefitData?.showcase !== undefined ? benefitData.showcase : false, Validators.required],
      order: [benefitData?.order || 1, [Validators.required, Validators.min(1)]],
      active: [benefitData?.active !== undefined ? benefitData.active : true, Validators.required]
    });
  }

  public moveCategory(fromIndex: number, toIndex: number): void {
    const categoriesArray = this.categoriesArray;
    const categoryToMove = categoriesArray.at(fromIndex);
    categoriesArray.removeAt(fromIndex);
    categoriesArray.insert(toIndex, categoryToMove);
  }

  public moveBenefit(categoryIndex: number, fromIndex: number, toIndex: number): void {
    const benefitsArray = this.getBenefitsArray(categoryIndex);
    const benefitToMove = benefitsArray.at(fromIndex);
    benefitsArray.removeAt(fromIndex);
    benefitsArray.insert(toIndex, benefitToMove);
  }
}
