import { Component, OnInit } from '@angular/core';
import { Observable, from } from 'rxjs';
import { take, flatMap, toArray } from 'rxjs/operators';

import { uuid as guid } from 'uuid/v4';

import { Notification, NotificationService } from '../../services/notification.service';

@Component({
  selector: 'tamu-gisc-notification-container',
  templateUrl: './containers.component.html',
  styleUrls: ['./containers.component.scss']
})
export class NotificationContainerComponent implements OnInit {
  public notifications: Observable<Notification[]>;

  constructor(private notification: NotificationService) {}

  public ngOnInit() {
    // Only display one notification at a time.
    this.notifications = this.notification.notifications.pipe(
      flatMap((val) => from(val)),
      take(1),
      toArray()
    );
  }

  /**
   * Invoke notification service method to remove the emitted Notification object
   *
   * @param event Notification object
   */
  public close(event: Notification): void {
    this.notification.remove(event);
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
