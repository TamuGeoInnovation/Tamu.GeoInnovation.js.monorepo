import { Component, inject, viewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';

import {
  SessionsUsingComponent,
  TagAddEditFormComponent,
  provideAdminDetailsPage
} from '@tamu-gisc/gisday/platform/ngx/common';
import { TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-tags-edit',
  templateUrl: './tags-edit.component.html',
  styleUrls: ['./tags-edit.component.scss'],
  imports: [TagAddEditFormComponent, SessionsUsingComponent, AsyncPipe],
  providers: [provideAdminDetailsPage(() => TagsEditComponent)]
})
export class TagsEditComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(TagAddEditFormComponent);
  private readonly tags = inject(TagService);

  /** The sessions that have this tag, so tags can be reviewed in one place (#3033). */
  public readonly sessions$ = inject(ActivatedRoute).params.pipe(
    map((params) => params['guid'] as string),
    switchMap((guid) => this.tags.getSessions(guid))
  );

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
