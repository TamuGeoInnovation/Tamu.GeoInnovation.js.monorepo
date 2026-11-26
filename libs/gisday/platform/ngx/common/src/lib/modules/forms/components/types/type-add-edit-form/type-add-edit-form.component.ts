import { Component, OnInit, inject, input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, filter, map, switchMap, take } from 'rxjs';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ButtonComponent, TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';

import { serverMessage } from '../../../../../utils/server-message';
import { injectBackToList } from '../../../admin-details-page';
import { TYPE_PAGE } from '../type-page';

/**
 * The add and edit form of a type: an RSVP type, a submission type (#3328). Which type, and its service, come from the
 * route's TYPE_PAGE. Save, Create and Delete go back to the list through the page it is on (#2965), as the tag form's do.
 */
@Component({
  selector: 'tamu-gisc-type-add-edit-form',
  templateUrl: './type-add-edit-form.component.html',
  imports: [FormsModule, ReactiveFormsModule, TextboxComponent, ButtonComponent]
})
export class TypeAddEditFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly at = inject(ActivatedRoute);
  private readonly ns = inject(NotificationService);

  public readonly page = inject(TYPE_PAGE);
  private readonly backToList = injectBackToList(this.page.list);

  public readonly type = input.required<'create' | 'edit'>();

  public form: UntypedFormGroup;

  public ngOnInit(): void {
    this.form = this.fb.group({ guid: [''], type: [''] });

    if (this.type() === 'edit') {
      this.at.params
        .pipe(
          map((params) => params.guid),
          filter((guid) => guid !== undefined),
          switchMap((guid) => this.page.service.getEntity(guid)),
          take(1)
        )
        .subscribe((entity) => this.form.patchValue(entity));
    }
  }

  public handleSubmission() {
    const value = this.form.getRawValue();
    const create = this.type() === 'create';
    const saved = create ? this.page.service.createEntity(value) : this.page.service.updateEntity(value.guid, value);

    this.done(saved, create ? 'Create' : 'Update', create ? 'created' : 'updated');
  }

  public deleteEntity() {
    this.done(this.page.service.deleteEntity(this.form.getRawValue().guid), 'Delete', 'deleted');
  }

  /** Says how a save, create or delete went, and goes back to the list once it has worked. */
  private done(request: Observable<unknown>, verb: string, past: string) {
    const id = `${verb.toLowerCase()}-${this.page.noun.toLowerCase().replace(/\s+/g, '-')}`;
    const title = `${verb} ${this.page.title}`;

    request.subscribe({
      next: () => {
        this.ns.toast({ id: `${id}-success`, title, message: `${this.page.title} ${past} successfully.` });
        this.backToList();
      },
      error: (err) => {
        this.ns.toast({
          id: `${id}-error`,
          title,
          message: serverMessage(err, `Error: the ${this.page.noun} could not be ${past}: ${err.status}`)
        });
      }
    });
  }
}
