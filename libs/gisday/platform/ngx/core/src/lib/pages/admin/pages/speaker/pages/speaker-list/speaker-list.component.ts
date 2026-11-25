import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SpeakerEditsService, SpeakerService, sendEditLinksToast } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { DashboardScrollComponent, sendProfileEmail } from '@tamu-gisc/gisday/platform/ngx/common';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { Observable, switchMap, take } from 'rxjs';
import { FormControl } from '@angular/forms';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { AdminSearchComponent } from '../../../base-admin-list/admin-search.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';
import { CentralDatePipe } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-speaker-list',
  templateUrl: './speaker-list.component.html',
  styleUrls: ['./speaker-list.component.scss'],
  imports: [
    SelectComponent,
    RouterLink,
    CheckboxComponent,
    AsyncPipe,
    CentralDatePipe,
    ExistsPipe,
    AdminSearchComponent,
    DashboardScrollComponent
  ]
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
  private readonly modals = inject(ModalService);

  /**
   * 'none' lists only the speakers in no session this season (#441), as the Events list's "no tags" box does (#3034). A
   * speaker copied into a season is listed in it whether or not they speak in it, which read as a broken season filter (#439).
   */
  public readonly inSessions = new FormControl('', { nonNullable: true });

  protected override listFilters(): Record<string, FormControl<string>> {
    return { ...super.listFilters(), sessions: this.inSessions };
  }

  protected override keepEntity(speaker: Partial<Speaker>): boolean {
    return this.inSessions.value !== 'none' || !speaker.events?.length;
  }

  /**
   * The speakers with each one's sessions (#441), from the speakers' own route behind `update:speakers`: the public season
   * list leaves the sessions out, as they include those hidden from the public schedule.
   */
  protected override listForSeason(seasonGuid: string | null): Observable<Array<Partial<Speaker>>> {
    return seasonGuid
      ? this.entityService.getEntitiesWithSessionsForSeason(seasonGuid)
      : this.entityService.getEntitiesWithSessionsForActiveSeason();
  }

  /** The speaker's sessions this season, by name, for the Sessions column (#441). Empty for a speaker in none. */
  public sessionNames(speaker: Partial<Speaker>): string {
    return (speaker.events ?? [])
      .map((event) => event.name)
      .filter((name) => !!name)
      .join(', ');
  }

  /** Emails each selected speaker their own link to edit their profile (#2936), the email read and edited first (#3023). */
  public emailEditLinks() {
    this.selectedRows$
      .pipe(
        take(1),
        switchMap((guids) =>
          sendProfileEmail(this.modals, this.speakerEdits.preview(guids), (email) => this.speakerEdits.send(guids, email))
        )
      )
      .subscribe({
        next: (result) => this.toasts.toast(sendEditLinksToast(result)),
        error: () =>
          this.toasts.toast({ id: 'speaker-edit-links', title: 'Profile emails not sent', message: 'Please try again.' })
      });
  }
}
