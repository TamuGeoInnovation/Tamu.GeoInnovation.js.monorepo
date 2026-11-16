import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, filter, firstValueFrom, map, switchMap } from 'rxjs';
import { RouterLink } from '@angular/router';

import { EventService, SessionFilesService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Event } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { AdminSearchComponent } from '../../../base-admin-list/admin-search.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe, DatePipe } from '@angular/common';
import {
  EventDayGroup,
  ParseDateTimeStringsPipe,
  groupEventsByDay,
  sessionSearchFields
} from '@tamu-gisc/gisday/platform/ngx/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';
import { SubmissionFileDto, siteListsSession } from '@tamu-gisc/gisday/common';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'tamu-gisc-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  imports: [
    SelectComponent,
    RouterLink,
    CheckboxComponent,
    AsyncPipe,
    DatePipe,
    ParseDateTimeStringsPipe,
    ExistsPipe,
    AdminSearchComponent
  ]
})
export class EventListComponent extends BaseAdminListComponent<Event> implements OnInit {
  /** The search (#2914) looks in the columns this page shows, as the public Sessions list does (#2944). */
  protected override readonly searchFields = (c: Partial<Event>) => sessionSearchFields(c);

  protected readonly entityService = inject(EventService);
  private readonly notifications = inject(NotificationService);
  public readonly site = inject(GISDAY_SITE);

  /**
   * On a site that lists only some organizations' sessions (gisday.tamu.edu), the list starts with those, and this
   * shows every organization's, as txgisday.org's admins share the database (#2986). 'all' or ''.
   */
  public readonly organizations = new FormControl('', { nonNullable: true });

  /** 'none' lists only the sessions with no tags, so they can be given some, the list shrinking as they are (#3034). */
  public readonly tagged = new FormControl('', { nonNullable: true });

  private readonly sessionFiles = inject(SessionFilesService);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * The season's sessions with and without slides (#3093): each session's slides, by its guid, for the Slides column,
   * uploaded by its speakers from their edit links. Null until listed.
   */
  public readonly slides = signal<Map<string, SubmissionFileDto> | null>(null);

  /** 'none' lists only the sessions with no slides yet, as the tags filter does (#3093). */
  public readonly withSlides = new FormControl('', { nonNullable: true });

  protected override listFilters(): Record<string, FormControl<string>> {
    return { ...super.listFilters(), organizations: this.organizations, tagged: this.tagged, slides: this.withSlides };
  }

  protected override keepEntity(event: Partial<Event>): boolean {
    return (
      (this.organizations.value === 'all' || siteListsSession(this.site, event)) &&
      (this.tagged.value !== 'none' || !event.tags?.length) &&
      (this.withSlides.value !== 'none' || !this.slides()?.has(event.guid))
    );
  }

  /**
   * The season's events as one table per day, under its date (#1775).
   */
  public eventsByDay$: Observable<Array<EventDayGroup<Partial<Event>>>>;

  public override ngOnInit(): void {
    super.ngOnInit();

    this.eventsByDay$ = this.entitiesForActiveSeasonOrForSeasonGuid$.pipe(map((events) => groupEventsByDay(events)));

    // The selected season's slides (#3093). Once they are in, the filters are read again, so "no slides" is right.
    this.selectedSeason$
      .pipe(
        filter((season) => !!season?.guid),
        switchMap((season) => this.sessionFiles.forSeason(season.guid)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((listed) => {
        this.slides.set(new Map(listed.map((s) => [s.event, s.file])));
        this.withSlides.updateValueAndValidity();
      });
  }

  /**
   * Whether every event of one day's table is selected, for that table's header checkbox.
   */
  public allSelected(selected: Array<string> | null, events: Array<Partial<Event>>): boolean {
    return events.length > 0 && events.every((event) => (selected ?? []).includes(event.guid));
  }

  /**
   * Puts events on the public schedule, or takes them off it, from this list, without opening each (#2092).
   * The public schedule leaves inactive events out.
   */
  public async setActive(guids: Array<string>, active: boolean) {
    const { updated } = await firstValueFrom(this.entityService.setActive(guids, active));

    this.notifications.toast({
      id: 'event-active',
      title: active ? 'Shown on the schedule' : 'Hidden from the schedule',
      message: `${updated} ${updated === 1 ? 'event' : 'events'} ${active ? 'now on' : 'taken off'} the public schedule.`
    });

    this.$signal.next(null);
  }

  /** The same, for every selected event. */
  public async setSelectedActive(active: boolean) {
    const selected = await firstValueFrom(this.selectedRows$);

    if (selected?.length) {
      await this.setActive(selected, active);
    }
  }

  public override promptCopyModal() {
    super.promptCopyModal(
      'Event',
      'This action will only copy event details and not any associated relations such as event date, presenters, or location as those change from season to season. Those will have to be set manually on a per-event basis.'
    );
  }

  public override promptDeleteModal() {
    super.promptDeleteModal('Event');
  }
}
