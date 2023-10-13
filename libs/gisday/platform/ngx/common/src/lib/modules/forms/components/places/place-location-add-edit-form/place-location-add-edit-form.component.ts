import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, filter, map, shareReplay, switchMap, take } from 'rxjs';

import { Place, PlaceLink } from '@tamu-gisc/gisday/platform/data-api';
import { PlaceService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

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
  public formLinks$: Observable<Partial<PlaceLink>[]>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly at: ActivatedRoute,
    private readonly rt: Router,
    private readonly ps: PlaceService,
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
      links: this.fb.array([])
    });

    this.formLinks$ = this.form.get('links').valueChanges.pipe(shareReplay());

    if (this.type === 'edit') {
      this.entity$ = this.at.params.pipe(
        map((params) => params.guid),
        filter((guid) => guid !== undefined),
        switchMap((guid) => this.ps.getEntity(guid))
      );

      this.entity$.pipe(take(1)).subscribe((entity) => {
        this.form.patchValue({ ...entity, links: entity?.links?.map((link) => this._createOrgLink(link)) });
      });
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

  public patchLink(link: Partial<PlaceLink>, index: number) {
    const control = (this.form.get('links') as FormArray).get(index.toString());

    control.patchValue(link);
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

    this.ps.updateEntity(rawValue.guid, rawValue).subscribe({
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
    const rawValue = this.form.getRawValue();

    this.ps.createEntity(rawValue).subscribe({
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

