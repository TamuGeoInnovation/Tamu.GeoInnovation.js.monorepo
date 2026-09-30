import { Component, Input, OnInit, OnDestroy, Optional } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { v4 as guid } from 'uuid';
import { Angulartics2 } from 'angulartics2';

import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../helpers/notification.helper';

/**
 * Several active notifications as one stacked toast, highest priority first.
 *
 * Its own component, and its own module, so the apps that do not use it do not ship it. Fourteen
 * applications render a notification container; one groups. Carrying ~5kB of grouping into the other
 * thirteen pushed `correction-lite-angular` past its 1MB budget - a budget five times tighter than its
 * siblings, and deliberately so.
 *
 * Grouping originates in #693. Priority ordering and the high-priority marker are #1195.
 */
@Component({
  selector: 'tamu-gisc-notification-grouped',
  templateUrl: './notification-grouped.component.html',
  styleUrls: ['./notification-grouped.component.scss']
})
export class NotificationGroupedComponent implements OnInit, OnDestroy {
  @Input()
  public position: 'left' | 'center' | 'right' = 'center';

  // Grouped mode state
  public groupedItems: Notification[] = [];
  public groupVisible = false;
  public groupShowing = false;
  public groupTimerPercent = 0;

  private _groupTimerStep = 50;
  private _groupTimerCurrent = 0;
  private _groupTimerLimit = 10000;
  private _groupTimerInterval: ReturnType<typeof setInterval> | undefined;
  private _groupSubscription: Subscription | undefined;

  constructor(
    @Optional() private readonly analytics: Angulartics2,
    @Optional() private readonly router: Router,
    private readonly service: NotificationService
  ) {}

  /**
   * Highest priority first, and within a priority the order they arrived in.
   *
   * A plain `sort` is not enough: it is only stable by specification in modern engines, and relying
   * on that would make "two ordinary notifications keep their order" an accident rather than a
   * guarantee. Sorting on the index makes it explicit.
   */
  public static byPriority(items: Notification[]): Notification[] {
    const rank = (item: Notification) => (item.priority === 'high' ? 0 : 1);

    return items
      .map((item, index) => ({ item, index }))
      .sort((a, b) => rank(a.item) - rank(b.item) || a.index - b.index)
      .map(({ item }) => item);
  }

  public ngOnInit() {
    this._groupSubscription = this.service.notifications.subscribe((items) => {
      const hadItems = this.groupedItems.length > 0;
      this.groupedItems = NotificationGroupedComponent.byPriority(items);

      if (items.length > 0 && !this.groupVisible) {
        this.groupVisible = true;
        setTimeout(() => {
          this.groupShowing = true;
        });
        this._startGroupTimer();
      } else if (items.length === 0 && hadItems) {
        this._triggerGroupHide();
      }
    });
  }

  public ngOnDestroy() {
    this._stopGroupTimer();
    this._groupSubscription?.unsubscribe();
  }

  // Forwarded from the grouped entries to the service, same as the plain container does.

  public close(event: Notification): void {
    this.service.remove(event);
  }

  public acknowledge(event: Notification): void {
    this.service.acknowledge(event);
  }

  public action(event: Notification): void {
    if (this.analytics !== null) {
      const label = {
        guid: guid(),
        date: Date.now(),
        name: event.id
      };

      this.analytics.eventTrack.next({
        action: 'notification_action',
        properties: {
          category: 'ui_interaction',
          gstCustom: label
        }
      });
    }
  }

  // --- Grouped mode methods ---

  public pauseGroup(): void {
    this._stopGroupTimer();
  }

  public resumeGroup(): void {
    this._startGroupTimer();
  }

  public closeGroup(): void {
    this._stopGroupTimer();
    const toRemove = [...this.groupedItems];
    this._triggerGroupHide();
    setTimeout(() => {
      toRemove.forEach((item) => this.service.remove(item));
    }, 300);
  }

  public acknowledgeGroupItem(item: Notification): void {
    this.service.acknowledge(item);
  }

  public closeGroupItem(item: Notification): void {
    this.service.remove(item);
  }

  public actionGroupItem(item: Notification): void {
    if (!item.action) {
      return;
    }

    this.action(item);
    this.service.remove(item);

    if (this.router) {
      this.router.navigate([item.action.value]);
    }
  }

  private _triggerGroupHide(): void {
    if (!this.groupVisible) {
      return;
    }
    this.groupShowing = false;
    setTimeout(() => {
      this.groupVisible = false;
      this._groupTimerCurrent = 0;
      this.groupTimerPercent = 0;
    }, 300);
  }

  private _startGroupTimer(): void {
    this._stopGroupTimer();
    this._groupTimerCurrent = 0;
    this._groupTimerInterval = setInterval(() => {
      this._groupTimerCurrent += this._groupTimerStep;
      this.groupTimerPercent = (this._groupTimerCurrent / this._groupTimerLimit) * 100;
      if (this._groupTimerCurrent >= this._groupTimerLimit) {
        this.closeGroup();
      }
    }, this._groupTimerStep);
  }

  private _stopGroupTimer(): void {
    if (this._groupTimerInterval) {
      clearInterval(this._groupTimerInterval);
      this._groupTimerInterval = undefined;
    }
  }
}
