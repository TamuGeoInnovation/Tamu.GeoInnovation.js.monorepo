import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { trigger, state, style, animate, transition } from '@angular/animations';
import { Notification } from '../../services/notification.service';

@Component({
  selector: 'tamu-gisc-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss'],
  animations: [
    trigger('animate', [
      state(
        'true',
        style({
          transform: 'translateY(-110%)'
        })
      ),
      state(
        'false',
        style({
          transform: 'translateY(10%)'
        })
      ),
      transition('* => *', [animate('250ms 0ms cubic-bezier(.25, 0, .25, 1.0)')])
    ])
  ]
})
export class NotificationItemComponent implements OnInit, OnDestroy {
  // Notification object passed in from the parent component
  @Input()
  public notification: Notification;

  // Output event that triggers the notification container to call the
  @Output()
  public closeNotification: EventEmitter<Notification> = new EventEmitter();

  /**
   * Event fired when a notification item registered action is triggered.
   */
  @Output()
  public actionNotification: EventEmitter<Notification> = new EventEmitter();

  // Animation trigger value.
  public animateStatus = true;

  /**
   * Step: Defines the rate at which each spawned notification updates its auto-dismiss progress.
   *
   * Current: Stores auto-dismiss progress (hover over), to resume on hover leave
   *
   * Limit: Defines the lifetime of the spawned notification in milliseconds
   *
   * Fn: Stores the spawned notification timing function
   */
  public timer: any = {
    step: 10,
    current: 0,
    limit: 10000,
    fn: undefined
  };

  constructor(private router: Router) {}

  public ngOnInit() {
    // Initiate timer auto-dismiss countdown
    this.countdown();
  }

  public ngOnDestroy() {
    // When the component is destroyed, clear the dismiss timer to prevent multiple
    // parallel timers interfering with each other, or just from running loose.
    // Basic cleanup
    clearInterval(this.timer.fn);
  }

  /**
   * Animates notification out of the view and calls the notification service to remove it from the active notifications
   */
  public close(): void {
    clearInterval(this.timer.fn);

    // Set animation trigger variable
    this.animateStatus = false;

    // Emit a closeNotification event after the notification node is out of the view.
    // The parent component communicates with the notification service to remove it.
    setTimeout(() => {
      this.closeNotification.emit(this.notification);
    }, 500);
  }

  /**
   * Clears the timing interval for the spawned notification.
   *
   * Triggered on hover-over
   */
  public pause(): void {
    clearInterval(this.timer.fn);
  }

  /**
   * Resumes the auto-dismiss timer for the spawned notification.
   *
   * Triggered on hover leave
   */
  public resume(): void {
    this.countdown();
  }

  /**
   * Initiates the auto-dismiss function for the spawned notification.
   *
   * Properties inherited from the timer property
   */
  private countdown(): void {
    this.timer.fn = setInterval(() => {
      this.timer.current += this.timer.step;

      if (this.timer.current >= this.timer.limit) {
        this.close();
      }
    }, this.timer.step);
  }

  /**
   * Carry out notification item action, if any is registered.
   */
  public action(): void {
    if (this.notification.action) {
      this.actionNotification.emit(this.notification);

      this.close();

      this.router.navigate([this.notification.action.value]);
    }
  }
}
