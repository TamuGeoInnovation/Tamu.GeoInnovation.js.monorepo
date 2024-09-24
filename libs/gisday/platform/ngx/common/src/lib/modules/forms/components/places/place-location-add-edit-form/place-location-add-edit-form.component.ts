import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, filter, map, merge, shareReplay, switchMap, take } from 'rxjs';

import { Place, PlaceLink } from '@tamu-gisc/gisday/platform/data-api';
import { AssetsService, PlaceService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { formToFormData } from '../../../../../utils/form-to-form-data';

@Component({
  selector: 'tamu-gisc-place-location-add-edit-form',
  templateUrl: './place-location-add-edit-form.component.html',
  styleUrls: ['./place-location-add-edit-form.component.scss']
})
export class PlaceLocationAddEditFormComponent implements OnInit {
  @Input()
  public type: 'create' | 'edit';

  public form: FormGroup;
  public entity$: Observable<Partial<Place>>;
  public logoUrl$: Observable<SafeUrl>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly at: ActivatedRoute,
    private readonly rt: Router,
    private readonly as: AssetsService,
    private readonly ps: PlaceService,
    private readonly sn: DomSanitizer,
    private readonly ns: NotificationService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [null],
      name: [null],
      address: [null],
      city: [null],
      state: [null],
      zip: [null],
      website: [null],
      links: this.fb.array([]),
      file: [null]
    });

    if (this.type === 'edit') {
      this.entity$ = this.at.params.pipe(
        map((params) => params.guid),
        filter((guid) => guid !== undefined),
        switchMap((guid) => this.ps.getEntity(guid)),
        shareReplay(1)
      );

      this.entity$.pipe(take(1)).subscribe((entity) => {
        const links = entity?.links?.map((link) => this._createOrgLink(link));

        this.form.patchValue({ ...entity });

        links.forEach((l) => (this.form.get('links') as FormArray).push(l));
      });

      // Image preview can come from two sources:
      // 1. The entity itself, if it has a photoUrl property
      // 2. The form, if the user has selected a file
      this.logoUrl$ = merge(
        this.entity$.pipe(
          filter((ent) => ent?.logos?.[0]?.guid !== undefined && ent?.logos?.[0]?.guid !== null),
          switchMap((entity) => {
            return this.as.getAssetUrl(entity?.logos?.[0]?.guid);
          })
        ),
        this.form.valueChanges.pipe(
          map((value) => value.file),
          filter((file) => file !== null),
          map((file) => this.sn.bypassSecurityTrustUrl(URL.createObjectURL(file)))
        )
      );
    }
  }

  public handleSubmission() {
    if (this.type === 'create') {
      this._createEntity();
    } else {
      this._updateEntity();
    }
  }

  public deleteEntity() {
    this.ps.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'place-delete-success',
          title: 'Delete Place',
          message: `Place was successfully deleted.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'place-delete-failed',
          title: 'Delete Place',
          message: `Error deleting place: ${err.status}`
        });
      }
    });
  }

  public addOrgLink() {
    const control = this._createOrgLink();

    (this.form.get('links') as FormArray).push(control);
  }

  public removeOrgLink(index: number) {
    (this.form.get('links') as FormArray).removeAt(index);
  }

  private _createOrgLink(values?: Partial<PlaceLink>) {
    return this.fb.control({
      guid: values?.guid || null,
      label: values?.label || null,
      url: values?.url || null
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();
    const formData = formToFormData(this.form, true);

    this.ps.updateEntityFormData(rawValue.guid, formData).subscribe({
      next: () => {
        this.ns.toast({
          id: 'place-update-success',
          title: 'Update Place',
          message: `Place was successfully updated.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'place-update-failed',
          title: 'Update Place',
          message: `Error updating place: ${err.status}`
        });
      }
    });
  }

  private _createEntity() {
    const formData = formToFormData(this.form, true);

    this.ps.createEntityFormData(formData).subscribe({
      next: () => {
        this.ns.toast({
          id: 'place-create-success',
          title: 'Create Place',
          message: `Place was successfully created.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'place-create-failed',
          title: 'Create Place',
          message: `Error creating place: ${err.status}`
        });
      }
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/places']);
  }
}
