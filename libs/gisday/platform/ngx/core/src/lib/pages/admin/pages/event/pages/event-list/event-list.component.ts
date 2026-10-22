import { Component, OnInit, inject } from '@angular/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { RouterLink } from '@angular/router';

import { EventService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Event } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe, DatePipe } from '@angular/common';
import { EventDayGroup, ParseDateTimeStringsPipe, groupEventsByDay } from '@tamu-gisc/gisday/platform/ngx/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  imports: [SelectComponent, RouterLink, CheckboxComponent, AsyncPipe, DatePipe, ParseDateTimeStringsPipe, ExistsPipe]
})
export class EventListComponent extends BaseAdminListComponent<Event> implements OnInit {
  protected readonly entityService = inject(EventService);
  private readonly notifications = inject(NotificationService);

  /**
   * The season's events as one table per day, under its date (#1775).
   */
  public eventsByDay$: Observable<Array<EventDayGroup<Partial<Event>>>>;

  public override ngOnInit(): void {
    super.ngOnInit();

    this.eventsByDay$ = this.entitiesForActiveSeasonOrForSeasonGuid$.pipe(map((events) => groupEventsByDay(events)));
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
