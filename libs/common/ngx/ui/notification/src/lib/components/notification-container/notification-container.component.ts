import { Component, Input, OnInit, Optional } from '@angular/core';
import { Observable } from 'rxjs';

import { v4 as guid } from 'uuid';
import { Angulartics2 } from 'angulartics2';

import { Notification, NotificationService } from '../../services/notification.service';

@Component({
  selector: 'tamu-gisc-notification-container',
  templateUrl: './notification-container.component.html',
  styleUrls: ['./notification-container.component.scss']
})
export class NotificationContainerComponent implements OnInit {
  @Input()
  public position: 'left' | 'center' | 'right' = 'center';

  public notifications: Observable<Notification[]>;

  constructor(@Optional() private analytics: Angulartics2, private service: NotificationService) {}

  public ngOnInit() {
    this.notifications = this.service.notifications;
  }

  /**
   * Invoke notification service method to remove the emitted Notification object
   *
   * @param event Notification object
   */
  public close(event: Notification): void {
    this.service.remove(event);
  }

  public action(event: Notification): void {
    if (this.analytics !== null) {
      const label = {
        guid: guid(),
        date: Date.now(),
        value: event.id
      };

      this.analytics.eventTrack.next({
        action: 'notification-action',
        properties: {
          category: 'ui_interaction',
          gstCustom: label
        }
      });
    }
  }
}
