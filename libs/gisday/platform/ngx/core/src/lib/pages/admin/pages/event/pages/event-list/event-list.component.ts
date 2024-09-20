import { Component, OnInit } from '@angular/core';
import { of, switchMap, withLatestFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { EventService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Event } from '@tamu-gisc/gisday/platform/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import {
  CopyEntityModalResponse,
  EntityCopyModalComponent,
  EntityDeleteModalComponent,
  EntityDeleteModalResponse
} from '@tamu-gisc/gisday/platform/ngx/common';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent extends BaseAdminListComponent<Event> implements OnInit {
  constructor(
    private readonly eventService: EventService,
    private readonly ss: SeasonService,
    private readonly ar: ActivatedRoute,
    private readonly rt: Router,
    private readonly ms: ModalService,
    private readonly ns: NotificationService
  ) {
    super(eventService, ss, ar, rt, ms, ns);
  }

  public ngOnInit() {
    super.ngOnInit();
  }

  public promptCopyModal() {
    of(true)
      .pipe(
        withLatestFrom(this.selectedRows$),
        switchMap(([, guids]) => {
          return this.ms.open(EntityCopyModalComponent, {
            data: {
              identities: guids,
              entityType: 'Event',
              notice:
                'This action will only copy event details and not any associated relations such as event date, presenters, or location as those change from season to season. Those will have to be set manually on a per-event basis.'
            }
          });
        })
      )
      .subscribe({
        next: (result: CopyEntityModalResponse<string>) => {
          if (result?.copy) {
            this.eventService.copyEventsIntoSeason(result?.season?.guid, result.identities).subscribe(() => {
              this.ns.toast({
                message: `${result.identities.length} event${result?.identities.length > 1 ? 's' : ''} copied into season ${
                  result.season?.year
                }`,
                id: 'event-copy-success',
                title: 'Events Copied'
              });

              this.$signal.next(null);
            });
          } else {
            console.log('Copy canceled');
          }
        }
      });
  }

  public promptDeleteModal() {
    of(true)
      .pipe(
        withLatestFrom(this.selectedRows$),
        switchMap(([, guids]) => {
          return this.ms.open(EntityDeleteModalComponent, {
            data: {
              identities: guids,
              entityType: 'Event'
            }
          });
        })
      )
      .subscribe({
        next: (result: EntityDeleteModalResponse) => {
          if (result?.delete) {
            this.eventService.deleteEvents(result?.identities).subscribe(() => {
              this.ns.toast({
                message: `${result.identities.length} event${result.identities.length > 1 ? 's' : ''} deleted`,
                id: 'event-delete-success',
                title: 'Events Deleted'
              });

              this.$signal.next(null);
            });
          } else {
            console.log('Delete canceled');
          }
        }
      });
  }
}
