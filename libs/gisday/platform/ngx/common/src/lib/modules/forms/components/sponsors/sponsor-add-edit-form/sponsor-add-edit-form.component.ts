import { Component, Input, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, filter, map, merge, shareReplay, switchMap, take } from 'rxjs';

import { Sponsor, Season } from '@tamu-gisc/gisday/platform/data-api';
import { AssetsService, SeasonService, SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { formToFormData } from '../../../../../utils/form-to-form-data';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { FileComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-sponsor-add-edit-form',
  templateUrl: './sponsor-add-edit-form.component.html',
  styleUrls: ['./sponsor-add-edit-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ReactiveFormsModule, TextboxComponent, SelectComponent, FileComponent, ButtonComponent, AsyncPipe]
})
export class SponsorAddEditFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly at = inject(ActivatedRoute);
  private readonly rt = inject(Router);
  private readonly as = inject(AssetsService);
  private readonly sss = inject(SponsorService);
  private readonly ss = inject(SeasonService);
  private readonly sn = inject(DomSanitizer);
  private readonly ns = inject(NotificationService);

  @Input()
  public type: 'create' | 'edit';

  public entity$: Observable<Partial<Sponsor>>;
  public activeSeasons$: Observable<Partial<Season>>;
  public logoUrl$: Observable<SafeUrl>;
  public form: UntypedFormGroup;

  public sponsorshipLevelsDict = [
    {
      value: 'raster',
      label: 'Raster'
    },
    {
      value: 'polygon',
      label: 'Polygon'
    },
    {
      value: 'line',
      label: 'Line'
    },
    {
      value: 'point',
      label: 'Point'
    }
  ];

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [null],
      name: [null],
      website: [null],
      description: [null],
      contactFirstName: [null],
      contactLastName: [null],
      contactEmail: [null],
      sponsorshipLevel: [null],
      season: [null],
      file: [null]
    });

    this.activeSeasons$ = this.ss.activeSeason$;

    this.entity$ = this.at.params.pipe(
      map((params) => params.guid),
      filter((guid) => guid !== undefined),
      switchMap((guid) => this.sss.getEntity(guid)),
      shareReplay()
    );

    // Image preview can come from two sources:
    // 1. The entity itself, if it has a photoUrl property
    // 2. The form, if the user has selected a file
    this.logoUrl$ = merge(
      this.entity$.pipe(
        filter((ent) => ent?.logos?.[0]?.guid !== undefined && ent?.logos?.[0]?.guid !== null),
        switchMap((entity) => {
          return this.as.getAssetUrl(entity?.logos?.[0]?.path);
        })
      ),
      this.form.valueChanges.pipe(
        map((value) => value.file),
        filter((file) => file !== null),
        map((file) => this.sn.bypassSecurityTrustUrl(URL.createObjectURL(file)))
      )
    );

    if (this.type === 'edit') {
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
    if (this.type === 'create') {
      this._createEntity();
    } else {
      this._updateEntity();
    }
  }

  public deleteEntity() {
    this.sss.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'sponsor-delete-success',
          title: 'Delete Sponsor',
          message: `Sponsor was successfully deleted.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'sponsor-delete-failed',
          title: 'Delete Sponsor',
          message: `Error deleting sponsor: ${err.status}`
        });
      }
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();
    const formData = formToFormData(this.form);

    this.sss.updateEntityFormData(rawValue.guid, formData).subscribe({
      next: () => {
        this.ns.toast({
          id: 'sponsor-update-success',
          title: 'Update Sponsor',
          message: `Sponsor was successfully updated.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'sponsor-update-failed',
          title: 'Update Sponsor',
          message: `Error updating sponsor: ${err.status}`
        });
      }
    });
  }

  private _createEntity() {
    const formData = formToFormData(this.form);

    this.sss.createEntityFormData(formData).subscribe({
      next: () => {
        this.ns.toast({
          id: 'sponsor-create-success',
          title: 'Create Sponsor',
          message: `Sponsor was successfully created.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'sponsor-create-failed',
          title: 'Create Sponsor',
          message: `Error creating sponsor: ${err.status}`
        });
      }
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/sponsors']);
  }
}
