import { Component, Input, OnInit, OnDestroy, Optional, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { v4 as guid } from 'uuid';
import { Angulartics2 } from 'angulartics2';

import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../helpers/notification.helper';
import { NgClass } from '@angular/common';

/**
 * Several active notifications as one stacked toast, highest priority first.
 *
 * Its own component, and its own module, so the apps that do not use it do not ship it. Fourteen
 * applications render a notification container; one groups. Carrying ~5kB of grouping into the other
 * thirteen pushed `correction-lite-angular` past its 1MB budget - a budget five times tighter than its
 * siblings, and deliberately so. That application has since been removed (#1339); the reason stands.
 *
 * Grouping originates in #693. Priority ordering and the high-priority marker are #1195.
 */
@Component({
    selector: 'tamu-gisc-notification-grouped',
    templateUrl: './notification-grouped.component.html',
    styleUrls: ['./notification-grouped.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgClass]
})
export class NotificationGroupedComponent implements OnInit, OnDestroy {
  @Input()
  public position: 'left' | 'center' | 'right' = 'center';

  // Grouped mode state
  public groupedItems: Notification[] = [];

  /**
   * Which notification is on screen. The panel shows one at a time (#1327): with four of them stacked
   * it ran most of the height of the map, and on a phone rather more than that.
   *
   * Kept as an index rather than a copy of the item, so that a notification being removed - actioned,
   * acknowledged, or cleared by its own service - cannot leave a stale object showing.
   */
  public groupIndex = 0;
  public groupVisible = false;
  public groupShowing = false;
  public groupTimerPercent = 0;

  /**
   * Held back because a modal is open.
   *
   * An event map can open a venue change or an event-passed warning as it loads, and the toast stack
   * would otherwise draw underneath it: unreadable, and competing with the thing the visitor has to
   * read first. The stack is not discarded, and its countdown is stopped rather than left running, so
   * it is still there to be read once the modal is dismissed instead of having quietly expired behind
   * it. See #1246.
   */
  public blockedByModal = false;

  private _groupTimerStep = 50;
  private _groupTimerCurrent = 0;
  private _groupTimerLimit = 10000;
  private _groupTimerInterval: ReturnType<typeof setInterval> | undefined;
  private _groupSubscription: Subscription | undefined;
  private _modalSubscription: Subscription | undefined;

  constructor(
    @Optional() private readonly analytics: Angulartics2,
    @Optional() private readonly router: Router,
    @Optional() private readonly modal: ModalService,
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

      // The list changes underneath this component - a notification is actioned, acknowledged, or
      // cleared by its own service - so the index is clamped rather than trusted. Without this,
      // removing the notification currently on screen leaves the panel rendering nothing (#1327).
      if (this.groupIndex > this.groupedItems.length - 1) {
        this.groupIndex = Math.max(0, this.groupedItems.length - 1);
      }

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

    this._modalSubscription = this.modal?.isOpen.subscribe((open) => {
      this.blockedByModal = open;

      if (open) {
        this._stopGroupTimer();
      } else if (this.groupedItems.length > 0) {
        this._startGroupTimer();
      }
    });
  }

  public ngOnDestroy() {
    this._stopGroupTimer();
    this._groupSubscription?.unsubscribe();
    this._modalSubscription?.unsubscribe();
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

  /** The notification on screen, or `undefined` while the group is emptying. */
  public get currentItem(): Notification | undefined {
    return this.groupedItems[this.groupIndex];
  }

  /** Whether there is more than one, and so whether the stepper is worth showing at all. */
  public get hasMultiple(): boolean {
    return this.groupedItems.length > 1;
  }

  /**
   * Steps forward, wrapping at the end.
   *
   * Wrapping rather than stopping: the panel is dismissed by its timer or its close button, so a
   * stepper that dead-ends on the last item would simply look broken for the ten seconds it is up.
   */
  public nextItem(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.groupedItems.length === 0) {
      return;
    }

    this.groupIndex = (this.groupIndex + 1) % this.groupedItems.length;
  }

  public previousItem(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.groupedItems.length === 0) {
      return;
    }

    this.groupIndex = (this.groupIndex - 1 + this.groupedItems.length) % this.groupedItems.length;
  }

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

  /**
   * Acting on an alert dismisses the whole batch, not only the one clicked.
   *
   * The service is root-scoped, so anything left behind outlives the navigation and reappears on the
   * destination: the user asks to be taken to a map and arrives to be told about that same map again,
   * alongside everything they did not click. Clicking one alert is a fair signal the batch has been
   * read, and `remove` is a dismissal rather than an acknowledgement, so they return on the next
   * visit to the homepage.
   *
   * The removals are synchronous, where `closeGroup` animates out over 300ms first. That delay is
   * long enough for the destination to render the stale toasts, which is the fault being fixed. The
   * subscription in `ngOnInit` still sees the store empty and animates the group away. See #1246.
   */
  public actionGroupItem(item: Notification): void {
    if (!item.action) {
      return;
    }

    this.action(item);

    this._stopGroupTimer();
    [...this.groupedItems].forEach((grouped) => this.service.remove(grouped));

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
