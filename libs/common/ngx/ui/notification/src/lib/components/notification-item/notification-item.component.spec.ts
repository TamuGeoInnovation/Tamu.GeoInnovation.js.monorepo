import { async, inject, TestBed } from '@angular/core/testing';

import { NotificationItemComponent } from './notification-item.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Notification } from '../../services/notification.service';

describe('NotificationItemComponent', () => {
  beforeEach(async(() => {
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

  it('should count down', (done) => {
    inject([NotificationItemComponent], (notificationItemComponent: NotificationItemComponent) => {
      const testNotification = new Notification({
        id: '0',
        title: 'test',
        message: 'howdy',
        action: { type: 'test', value: 'value' }
      });
      notificationItemComponent.notification = testNotification;

      jest.useFakeTimers();
      notificationItemComponent.ngOnInit();
      jest.advanceTimersByTime(60);
      expect(notificationItemComponent.timer.current).toEqual(60);

      notificationItemComponent.pause();
      jest.advanceTimersByTime(1000);
      expect(notificationItemComponent.timer.current).toEqual(60);

      notificationItemComponent.resume();
      jest.advanceTimersByTime(60);
      expect(notificationItemComponent.timer.current).toEqual(120);

      jest.advanceTimersByTime(10000);
      expect(notificationItemComponent.animateStatus).toBeFalsy();

      notificationItemComponent.closeNotification.subscribe((closed) => {
        expect(closed).toEqual(testNotification);
        done();
      });
      jest.advanceTimersByTime(500);

      notificationItemComponent.animateStatus = true;
      // TODO: The tests for this component are currently not working.
      // The following lines throws eslint errors but might be necessary when tests are fixed
      //
      // console.warn = () => {}; // Disable ngZone warning
      notificationItemComponent.action();
      expect(notificationItemComponent.animateStatus).toBeFalsy();
    })();
  });
});
