import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SpeakerEditsService, SpeakerService, sendEditLinksToast } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { switchMap, take } from 'rxjs';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { AdminSearchComponent } from '../../../base-admin-list/admin-search.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';

@Component({
  selector: 'tamu-gisc-speaker-list',
  templateUrl: './speaker-list.component.html',
  styleUrls: ['./speaker-list.component.scss'],
  imports: [SelectComponent, RouterLink, CheckboxComponent, AsyncPipe, DatePipe, ExistsPipe, AdminSearchComponent]
})
export class SpeakerListComponent extends BaseAdminListComponent<Speaker> {
  /** The search (#2914) looks in the columns this page shows. */
  protected override readonly searchFields = (c: Partial<Speaker>) => [
    `${c.firstName ?? ''} ${c.lastName ?? ''}`,
    c.email,
    c.organization?.name
  ];

  protected readonly entityService = inject(SpeakerService);
  private readonly speakerEdits = inject(SpeakerEditsService);
  private readonly toasts = inject(NotificationService);

  /** Emails each selected speaker their own link to edit their profile (#2936). */
  public emailEditLinks() {
    this.selectedRows$
      .pipe(
        take(1),
        switchMap((guids) => this.speakerEdits.send(guids))
      )
      .subscribe({
        next: (result) => this.toasts.toast(sendEditLinksToast(result)),
        error: () =>
          this.toasts.toast({ id: 'speaker-edit-links', title: 'Profile emails not sent', message: 'Please try again.' })
      });
  }
}
