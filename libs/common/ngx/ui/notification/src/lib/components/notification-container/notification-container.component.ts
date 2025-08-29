import { Component, Input, OnInit, Optional } from '@angular/core';
import { Observable } from 'rxjs';

import { v4 as guid } from 'uuid';
import { Angulartics2 } from 'angulartics2';

import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../helpers/notification.helper';

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

  /**
   * Invoke notification service method to acknowledge the emitted Notification object
   *
   * @param event Notification object
   */
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
}
