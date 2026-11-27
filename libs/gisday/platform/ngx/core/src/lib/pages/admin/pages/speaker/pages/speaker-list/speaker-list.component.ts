import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SpeakerEditsService, SpeakerService, sendEditLinksToast } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { DashboardScrollComponent, sendProfileEmail } from '@tamu-gisc/gisday/platform/ngx/common';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { Observable, map, switchMap, take } from 'rxjs';
import { FormControl } from '@angular/forms';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { AdminSearchComponent } from '../../../base-admin-list/admin-search.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';
import { CentralDatePipe } from '@tamu-gisc/gisday/platform/ngx/common';

/**
 * The tags of these speakers' sessions, each once, by name, after every tag (#440): what the admin Speakers list offers
 * to show the speakers in one kind of session, as the Events list offers organizations (#434).
 */
export function sessionTagChoices(speakers: Array<Partial<Speaker>> | null): Array<{ guid: string; name: string }> {
  const tags = new Map<string, string>();

  for (const event of (speakers ?? []).flatMap((speaker) => speaker.events ?? [])) {
    for (const tag of event.tags ?? []) {
      if (tag?.guid) {
        tags.set(tag.guid, tag.name ?? '');
      }
    }
  }

  const named = [...tags].map(([guid, name]) => ({ guid, name })).sort((a, b) => a.name.localeCompare(b.name));

  return [{ guid: '', name: 'Every tag' }, ...named];
}

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

  /**
   * The speakers in a session with one tag (#440): the tag's guid, or '' for every speaker. Organizers inviting past
   * panelists back needed every speaker of one kind of session, which the list could not show.
   */
  public readonly sessionTag = new FormControl('', { nonNullable: true });

  /** The tags of the season's sessions, by name, after every tag, for that choice (#440). */
  public sessionTagChoices$: Observable<Array<{ guid: string; name: string }>>;

  protected override listFilters(): Record<string, FormControl<string>> {
    return { ...super.listFilters(), sessions: this.inSessions, sessionTag: this.sessionTag };
  }

  protected override keepEntity(speaker: Partial<Speaker>): boolean {
    const tag = this.sessionTag.value;

    return (
      (this.inSessions.value !== 'none' || !speaker.events?.length) &&
      (!tag || (speaker.events ?? []).some((event) => (event.tags ?? []).some((t) => t?.guid === tag)))
    );
  }

  public override ngOnInit(): void {
    super.ngOnInit();

    this.sessionTagChoices$ = this.listed$.pipe(map((speakers) => sessionTagChoices(speakers)));
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
