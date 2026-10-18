import {
  Component,
  OnInit,
  OnDestroy,
  HostBinding,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';

import { Notification } from '../../helpers/notification.helper';

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
  private router = inject(Router);

  // Notification object passed in from the parent component
  public readonly notification = input<Notification>(undefined);

  public readonly position = input<'left' | 'center' | 'right'>(undefined);

  @HostBinding('class')
  private get _classes() {
    return this.position();
  }

  // Output event that triggers the notification container to call the notification service remove method
  public readonly closeNotification = output<Notification>();

  // Output event that triggers the notification container to call the notification service acknowledge method
  public readonly acknowledgeNotification = output<Notification>();

  /**
   * Event fired when a notification item registered action is triggered.
   */
  public readonly actionNotification = output<Notification>();

  // Animation trigger value.
  public readonly animateStatus = signal(true);

  /**
   * Step: Defines the rate at which each spawned notification updates its auto-dismiss progress.
   *
   * Current: Stores auto-dismiss progress (hover over), to resume on hover leave
   *
   * Limit: Defines the lifetime of the spawned notification in milliseconds
   *
   * Fn: Stores the spawned notification timing function
   */
  public timer = {
    step: 50,
    current: signal(0),
    limit: 10000,
    fn: undefined
  };

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
   * This method is used for dismissing/timing out notifications (not acknowledging them)
   */
  public close(): void {
    clearInterval(this.timer.fn);

    // Set animation trigger variable
    this.animateStatus.set(false);

    // Emit a closeNotification event after the notification node is out of the view.
    // The parent component communicates with the notification service to remove it.
    setTimeout(() => {
      this.closeNotification.emit(this.notification());
    }, 500);
  }

  /**
   * Acknowledges the notification, marking it so it won't be shown again.
   * This method is called when the user clicks "Don't show again".
   */
  public acknowledge(): void {
    clearInterval(this.timer.fn);

    // Set animation trigger variable
    this.animateStatus.set(false);

    // Emit an acknowledgeNotification event after the notification node is out of the view.
    // The parent component communicates with the notification service to acknowledge it.
    setTimeout(() => {
      this.acknowledgeNotification.emit(this.notification());
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
      this.timer.current.update((current) => current + this.timer.step);

      if (this.timer.current() >= this.timer.limit) {
        this.close();
      }
    }, this.timer.step);
  }

  /**
   * Carry out notification item action, if any is registered.
   */
  public action(): void {
    const notification = this.notification();

    if (notification.action) {
      this.actionNotification.emit(notification);

      this.close();

      this.router.navigate([notification.action.value]);
    }
  }
}
