import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { v4 as guid } from 'uuid';

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

  constructor(private service: NotificationService) {}

  public ngOnInit() {
    // Only display one notification at a time.
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
    // const label = {
    //   guid: guid(),
    //   date: Date.now(),
    //   value: event.id
    // };
    // this.analytics.eventTrack.next({
    //   action: 'Notification Action',
    //   properties: {
    //     category: 'UI Interaction',
    //     label: JSON.stringify(label)
    //   }
    // });
  }
}
