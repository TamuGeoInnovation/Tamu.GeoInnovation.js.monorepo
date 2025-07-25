import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, of, take } from 'rxjs';

import { DragulaService } from 'ng2-dragula';

import { Tier } from '@tamu-gisc/geoservices/data-api';
import { TiersService } from '@tamu-gisc/geoservices/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { AdminTierFormService } from '../../services/admin-tier-form/admin-tier-form.service';

@Component({
  selector: 'tamu-gisc-tier-add-edit-form',
  templateUrl: './tier-add-edit-form.component.html',
  styleUrls: ['./tier-add-edit-form.component.scss'],
  providers: [AdminTierFormService] // Scoped provider for this component. This enables us to clear the form state when component is destroyed.
})
export class TierAddEditFormComponent implements OnInit, OnDestroy {
  @Input()
  public type: 'create' | 'edit' = 'create';

  @Input()
  public entityId?: number;

  public subscriptionIntervals = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' }
  ];

  public entity$: Observable<Tier | undefined>;
  public form: FormGroup = this.ats.form;

  constructor(
    private readonly router: Router,
    private readonly tiersService: TiersService,
    private readonly notificationService: NotificationService,
    private readonly modalService: ModalService,
    private readonly ds: DragulaService,
    private readonly ats: AdminTierFormService
  ) {
    this.ds.createGroup('CATEGORIES', {
      direction: 'vertical',
      moves: (el, container, handle) => {
        const nearestDragulaElement = handle?.closest('[dragula]');
        const hasCorrectDragulaAttribute = nearestDragulaElement?.getAttribute('dragula') === 'CATEGORIES';
        const isOnHandle = handle?.classList.contains('title-container') || false;

        return hasCorrectDragulaAttribute && isOnHandle;
      },
      accepts: (el, target) => {
        return target?.getAttribute('dragula') === 'CATEGORIES';
      }
    });

    this.ds.createGroup('BENEFITS', {
      direction: 'vertical',
      moves: (el, container, handle) => {
        const nearestDragulaElement = handle?.closest('[dragula]');
        const hasCorrectDragulaAttribute = nearestDragulaElement?.getAttribute('dragula') === 'BENEFITS';
        const isOnHandle = handle?.classList.contains('title-container') || false;

        return hasCorrectDragulaAttribute && isOnHandle;
      },
      accepts: (el, target) => {
        return target?.getAttribute('dragula') === 'BENEFITS';
      }
    });
  }

  public ngOnInit(): void {
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
          this.ats.patchFormWithEntity(entity);
        }
      });
    }
  }

  public ngOnDestroy(): void {
    // Cleanup Dragula subscriptions
    this.ds.destroy('CATEGORIES');
    this.ds.destroy('BENEFITS');
  }

  // Getter for categories form array
  public get categoriesArray(): FormArray {
    return this.ats.categoriesArray;
  }

  // Getter for typed category controls
  public get categoryControls(): FormGroup[] {
    return this.categoriesArray.controls as FormGroup[];
  }

  // Category management methods
  public addCategory(): void {
    this.ats.addCategory();
  }

  public deleteCategory(index: number): void {
    this.ats.deleteCategory(index);
  }

  public handleSubmission() {
    if (this.form.valid) {
      if (this.type === 'create') {
        this._createEntity();
      } else {
        this._updateEntity();
      }
    } else {
      this.ats.markFormGroupTouched();
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

  public calculateControlArrayOrder(): void {
    this.ats.calculateControlArrayOrder(this.categoriesArray.controls);
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
}
