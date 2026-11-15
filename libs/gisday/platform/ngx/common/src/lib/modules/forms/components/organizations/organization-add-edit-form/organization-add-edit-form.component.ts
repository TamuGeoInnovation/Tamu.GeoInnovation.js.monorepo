import { Component, OnInit, inject, input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, filter, map, of, shareReplay, switchMap, take } from 'rxjs';

import { Organization, Season } from '@tamu-gisc/gisday/platform/data-api';
import { AssetsService, OrganizationService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { formToFormData } from '../../../../../utils/form-to-form-data';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { FileComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { ImagePreviewComponent } from '../../../../images/components/image-preview/image-preview.component';
import { uploadPreviewUrl } from '../../../../images/upload-preview-url';

@Component({
  selector: 'tamu-gisc-organization-add-edit-form',
  templateUrl: './organization-add-edit-form.component.html',
  styleUrls: ['./organization-add-edit-form.component.scss'],
  imports: [ImagePreviewComponent, FormsModule, ReactiveFormsModule, TextboxComponent, FileComponent, ButtonComponent, AsyncPipe]
})
export class OrganizationAddEditFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly at = inject(ActivatedRoute);
  private readonly rt = inject(Router);
  private readonly as = inject(AssetsService);
  private readonly os = inject(OrganizationService);
  private readonly ss = inject(SeasonService);
  private readonly sn = inject(DomSanitizer);
  private readonly ns = inject(NotificationService);

  public readonly type = input<'create' | 'edit'>(undefined);

  public entity$: Observable<Partial<Organization>>;
  public activeSeasons$: Observable<Partial<Season>>;
  public logoUrl$: Observable<SafeUrl | string | null>;
  public form: UntypedFormGroup;

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [null],
      name: [null],
      acronym: [null],
      website: [null],
      text: [null],
      contactFirstName: [null],
      contactLastName: [null],
      contactEmail: [null],
      season: [null],
      file: [null]
    });

    this.activeSeasons$ = this.ss.activeSeason$;

    this.entity$ = this.at.params.pipe(
      map((params) => params.guid),
      filter((guid) => guid !== undefined),
      switchMap((guid) => this.os.getEntity(guid)),
      shareReplay()
    );


    // The chosen logo, else the saved one, else nothing (#2569); drawn by tamu-gisc-image-preview, never a broken image.
    this.logoUrl$ = uploadPreviewUrl(
      (this.entity$ ?? of(null)).pipe(
        switchMap((entity) => (entity?.logos?.[0]?.path ? this.as.getAssetUrl(entity.logos[0].path) : of(null)))
      ),
      this.form.get('file').valueChanges,
      this.sn
    );

    if (this.type() === 'edit') {
      this.entity$.pipe(take(1)).subscribe((entity) => {
        this.form.patchValue({
          ...entity,
          season: entity?.season?.guid
        });
      });
    } else {
      this.activeSeasons$.pipe(take(1)).subscribe((season) => {
        this.form.patchValue({ season: season.guid });
      });
    }
  }

  public handleSubmission() {
    if (this.type() === 'create') {
      this._createEntity();
    } else {
      this._updateEntity();
    }
  }

  public deleteEntity() {
    this.os.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'org-delete-success',
          title: 'Delete organization',
          message: `Organization was successfully deleted.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'org-delete-failed',
          title: 'Delete organization',
          message: `Error deleting organization: ${err.status}`
        });
      }
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();
    const formData = formToFormData(this.form);

    this.os.updateEntityFormData(rawValue.guid, formData).subscribe({
      next: () => {
        this.ns.toast({
          id: 'org-update-success',
          title: 'Update organization',
          message: `Organization was successfully updated.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'org-update-failed',
          title: 'Update organization',
          message: `Error updating organization: ${err.status}`
        });
      }
    });
  }

  private _createEntity() {
    const formData = formToFormData(this.form);

    this.os.createEntityFormData(formData).subscribe({
      next: () => {
        this.ns.toast({
          id: 'org-create-success',
          title: 'Create organization',
          message: `Organization was successfully created.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'org-create-failed',
          title: 'Create organization',
          message: `Error creating organization: ${err.status}`
        });
      }
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/organizations']);
  }
}
