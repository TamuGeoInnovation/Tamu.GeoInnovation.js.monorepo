import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NotificationItemComponent } from './notification-item.component';
import { Notification } from '../../helpers/notification.helper';

describe('NotificationItemComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [NotificationItemComponent],
      declarations: [NotificationItemComponent],
      imports: [RouterTestingModule.withRoutes([{ path: 'value', component: NotificationItemComponent }])]
    }).compileComponents();
  }));

  it('should create', inject([NotificationItemComponent], (notificationItemComponent: NotificationItemComponent) => {
    expect(notificationItemComponent).toBeTruthy();
    expect(notificationItemComponent.timer.current).toEqual(0);
    expect(notificationItemComponent.ngOnDestroy()).toBeUndefined();
  }));

  /**
   * The countdown advances by `timer.step` on an interval of `timer.step` milliseconds, so
   * `timer.current` counts in whole steps -- it is not a running total of elapsed time. The
   * original assertions expected 60 and 120 after advancing 60ms twice, which assumed the latter.
   * With a step of 50 the real values are 50 and 100.
   */
  it('should count down', (done) => {
    inject([NotificationItemComponent], (notificationItemComponent: NotificationItemComponent) => {
      const testNotification = new Notification({
        id: '0',
        title: 'test',
        message: 'howdy',
        action: { type: 'test', value: 'value' }
      });
      notificationItemComponent.notification = testNotification;

      const step = notificationItemComponent.timer.step;

      jest.useFakeTimers();
      notificationItemComponent.ngOnInit();

      jest.advanceTimersByTime(step + 10);
      expect(notificationItemComponent.timer.current).toEqual(step);

      // Paused: further time passing must not advance the counter.
      notificationItemComponent.pause();
      jest.advanceTimersByTime(1000);
      expect(notificationItemComponent.timer.current).toEqual(step);

      notificationItemComponent.resume();
      jest.advanceTimersByTime(step + 10);
      expect(notificationItemComponent.timer.current).toEqual(step * 2);

      jest.advanceTimersByTime(10000);
      expect(notificationItemComponent.animateStatus).toBeFalsy();

      notificationItemComponent.closeNotification.subscribe((closed) => {
        expect(closed).toEqual(testNotification);
        done();
      });
      jest.advanceTimersByTime(500);

      notificationItemComponent.animateStatus = true;
      notificationItemComponent.action();
      expect(notificationItemComponent.animateStatus).toBeFalsy();
    })();
  });
});
