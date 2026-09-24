import { Component, Input, OnInit, OnDestroy, Optional } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { v4 as guid } from 'uuid';
import { Angulartics2 } from 'angulartics2';

import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../helpers/notification.helper';

@Component({
  selector: 'tamu-gisc-notification-container',
  templateUrl: './notification-container.component.html',
  styleUrls: ['./notification-container.component.scss']
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  @Input()
  public position: 'left' | 'center' | 'right' = 'center';

  /**
   * When true, multiple active notifications are merged into a single stacked toast
   * instead of overlapping individual toasts. Does not affect existing behavior when false.
   */
  @Input()
  public grouped = false;

  public notifications: Observable<Notification[]>;

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

  public ngOnInit() {
    this.notifications = this.service.notifications;

    if (this.grouped) {
      this._groupSubscription = this.service.notifications.subscribe((items) => {
        const hadItems = this.groupedItems.length > 0;
        this.groupedItems = [...items];

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
  }

  public ngOnDestroy() {
    this._stopGroupTimer();
    this._groupSubscription?.unsubscribe();
  }

  // --- Non-grouped methods (unchanged behavior) ---

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
