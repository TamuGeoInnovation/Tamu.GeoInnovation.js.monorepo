import { Component, OnInit, inject, input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, catchError, concatMap, filter, from, map, of, shareReplay, switchMap, take, toArray } from 'rxjs';

import { Class, UserClass } from '@tamu-gisc/gisday/platform/data-api';
import { ClassService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { serverMessage } from '../../../../../utils/server-message';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

import { adminEntityForm } from '../../../admin-entity-form';

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
  /** Its save and delete, and what they say (#3340). */
  private readonly saves = adminEntityForm('Class', '/admin/classes');
  private readonly cs = inject(ClassService);
  private readonly ss = inject(SeasonService);
  private readonly ns = inject(NotificationService);

  public readonly type = input.required<'create' | 'edit'>();

  public entity$: Observable<Partial<Class>>;
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
      this.ss.activeSeason$.pipe(take(1)).subscribe((season) => {
        // With no active season, the form's season is left empty.
        if (season) {
          this.form.patchValue({ season: season.guid });
        }
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
    this.saves.save('delete', this.cs.deleteEntity(this.form.getRawValue().guid));
  }

  private _updateEntity() {
    const rawValue = this.form.getRawValue();

    this.saves.save('update', this.cs.updateEntity(rawValue.guid, rawValue));
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

    // Each section, with why it could not be added, if it could not.
    type SectionResult = { section: string; error?: string };

    from(sections)
      .pipe(
        concatMap((section) =>
          this.cs.createEntity({ ...rawValue, section }).pipe(
            map((): SectionResult => ({ section })),
            catchError((err) => of<SectionResult>({ section, error: serverMessage(err, `${err?.status}`) }))
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
            title: 'Create Class',
            message: `${created.length} sections of ${course} were successfully created: ${created.join(', ')}.`
          });

          this._navigateBack();
          return;
        }

        this.form.patchValue({ section: failed.map((r) => r.section).join(', ') });

        this.ns.toast({
          id: 'class-create-failed',
          title: 'Create Class',
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
          title: 'Create Class',
          message: `Class was successfully created.`
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'class-create-failed',
          title: 'Create Class',
          message: `Error creating class: ${serverMessage(err, `${err?.status}`)}`
        });
      }
    });
  }

  private _navigateBack() {
    this.saves.back();
  }
}
