import { Component, OnInit, inject, input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, catchError, concatMap, filter, from, map, of, shareReplay, switchMap, take, toArray } from 'rxjs';

import { Class, Season, UserClass } from '@tamu-gisc/gisday/platform/data-api';
import { ClassService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

/**
 * The sections typed into Create Class's section field: one, or several separated by commas, semicolons or spaces,
 * each once and in the order typed (#2872).
 */
export function sectionsFrom(text: string): Array<string> {
  return [...new Set((text ?? '').split(/[\s,;]+/).filter((section) => section !== ''))];
}

@Component({
  selector: 'tamu-gisc-class-add-edit-form',
  templateUrl: './class-add-edit-form.component.html',
  styleUrls: ['./class-add-edit-form.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, TextboxComponent, ButtonComponent]
})
export class ClassAddEditFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly at = inject(ActivatedRoute);
  private readonly rt = inject(Router);
  private readonly cs = inject(ClassService);
  private readonly ss = inject(SeasonService);
  private readonly ns = inject(NotificationService);

  public readonly type = input<'create' | 'edit'>(undefined);

  public entity$: Observable<Partial<Class>>;
  public activeSeasons$: Observable<Partial<Season>>;
  public students$: Observable<Array<Partial<UserClass>>>;
  public form: UntypedFormGroup;

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [null],
      title: [null],
      number: [null],
      code: [null],
      section: [null],
      professorName: [null],
      season: [null]
    });

    this.activeSeasons$ = this.ss.activeSeason$;

    this.entity$ = this.at.params.pipe(
      map((params) => params.guid),
      filter((guid) => guid !== undefined),
      switchMap((guid) => this.cs.getEntity(guid)),
      shareReplay()
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
    this.cs.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'class-delete-success',
          title: 'Delete class',
          message: `Class was successfully deleted.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'class-delete-failed',
          title: 'Delete class',
          message: `Error deleting class: ${err.status}`
        });
      }
    });
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();

    this.cs.updateEntity(rawValue.guid, rawValue).subscribe({
      next: () => {
        this.ns.toast({
          id: 'class-update-success',
          title: 'Update class',
          message: `Class was successfully updated.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'class-update-failed',
          title: 'Update class',
          message: `Error updating class: ${err.status}`
        });
      }
    });
  }

  /**
   * Adds the class, once for each section listed (#2872), one at a time. Sections that could not be added are named
   * and left in the form, with the page kept open, so they can be corrected and created again.
   */
  private _createEntity() {
    const rawValue = this.form.getRawValue();
    const sections = sectionsFrom(rawValue.section);

    if (sections.length <= 1) {
      this._createOne({ ...rawValue, section: sections[0] ?? rawValue.section });
      return;
    }

    from(sections)
      .pipe(
        concatMap((section) =>
          this.cs.createEntity({ ...rawValue, section }).pipe(
            map(() => ({ section, error: undefined as string })),
            catchError((err) => of({ section, error: `${err?.error?.message ?? err.status}` }))
          )
        ),
        toArray()
      )
      .subscribe((results) => {
        const created = results.filter((r) => r.error === undefined).map((r) => r.section);
        const failed = results.filter((r) => r.error !== undefined);
        const course = `${rawValue.code ?? ''} ${rawValue.number ?? ''}`.trim();

        if (failed.length === 0) {
          this.ns.toast({
            id: 'class-create-success',
            title: 'Create class',
            message: `${created.length} sections of ${course} were successfully created: ${created.join(', ')}.`
          });

          this._navigateBack();
          return;
        }

        this.form.patchValue({ section: failed.map((r) => r.section).join(', ') });

        this.ns.toast({
          id: 'class-create-failed',
          title: 'Create class',
          message:
            (created.length > 0 ? `Created sections ${created.join(', ')}. ` : '') +
            `Not created: ${failed.map((r) => `${r.section} (${r.error})`).join(', ')}. They are left in the form.`
        });
      });
  }

  private _createOne(value: Partial<Class>) {
    this.cs.createEntity(value).subscribe({
      next: () => {
        this.ns.toast({
          id: 'class-create-success',
          title: 'Create class',
          message: `Class was successfully created.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'class-create-failed',
          title: 'Create class',
          message: `Error creating class: ${err?.error?.message ?? err.status}`
        });
      }
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/classes']);
  }
}
