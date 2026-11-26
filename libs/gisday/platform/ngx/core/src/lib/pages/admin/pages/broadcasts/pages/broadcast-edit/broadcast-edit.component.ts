import { Component, inject, viewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';

import {
  BroadcastAddEditFormComponent,
  SessionsUsingComponent,
  provideAdminDetailsPage
} from '@tamu-gisc/gisday/platform/ngx/common';
import { BroadcastService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { BaseAdminDetailsPageComponent } from '../../../base-admin-details-page/base-admin-details-page.component';

@Component({
  selector: 'tamu-gisc-broadcast-edit',
  templateUrl: './broadcast-edit.component.html',
  styleUrls: ['./broadcast-edit.component.scss'],
  imports: [BroadcastAddEditFormComponent, SessionsUsingComponent, AsyncPipe],
  providers: [provideAdminDetailsPage(() => BroadcastEditComponent)]
})
export class BroadcastEditComponent extends BaseAdminDetailsPageComponent {
  private readonly editor = viewChild(BroadcastAddEditFormComponent);
  private readonly broadcasts = inject(BroadcastService);

  /** The sessions that use this broadcast, so an admin can see which each Zoom is attached to (#3032). */
  public readonly sessions$ = inject(ActivatedRoute).params.pipe(
    map((params) => params['guid'] as string),
    switchMap((guid) => this.broadcasts.getSessions(guid))
  );

  protected override detailsForm() {
    return this.editor()?.form;
  }
}
