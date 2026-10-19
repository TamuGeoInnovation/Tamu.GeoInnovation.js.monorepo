import { inject, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { NotificationItemComponent } from './notification-item.component';
import { Notification } from '../../helpers/notification.helper';

describe('NotificationItemComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Zoneless, Angular renders a created component by itself, so its @animate trigger needs an
      // animations provider (#1478).
      providers: [NotificationItemComponent, provideNoopAnimations()],
      imports: [
        RouterTestingModule.withRoutes([{ path: 'value', component: NotificationItemComponent }]),
        NotificationItemComponent
      ]
    }).compileComponents();
  });

  it('should create', inject([NotificationItemComponent], (notificationItemComponent: NotificationItemComponent) => {
    expect(notificationItemComponent).toBeTruthy();
    expect(notificationItemComponent.timer.current()).toEqual(0);
    expect(notificationItemComponent.ngOnDestroy()).toBeUndefined();
  }));

  /**
   * The countdown advances by `timer.step` on an interval of `timer.step` milliseconds, so
   * `timer.current` counts in whole steps -- it is not a running total of elapsed time. The
   * original assertions expected 60 and 120 after advancing 60ms twice, which assumed the latter.
   * With a step of 50 the real values are 50 and 100.
   */
  it('should count down', () =>
    new Promise<void>((done) => {
      const fixture = TestBed.createComponent(NotificationItemComponent);
      const notificationItemComponent = fixture.componentInstance;
      const testNotification = new Notification({
        id: '0',
        title: 'test',
        message: 'howdy',
        action: { type: 'test', value: 'value' }
      });
      fixture.componentRef.setInput('notification', testNotification);

      const step = notificationItemComponent.timer.step;

      vi.useFakeTimers();
      notificationItemComponent.ngOnInit();

      vi.advanceTimersByTime(step + 10);
      expect(notificationItemComponent.timer.current()).toEqual(step);

      // Paused: further time passing must not advance the counter.
      notificationItemComponent.pause();
      vi.advanceTimersByTime(1000);
      expect(notificationItemComponent.timer.current()).toEqual(step);

      notificationItemComponent.resume();
      vi.advanceTimersByTime(step + 10);
      expect(notificationItemComponent.timer.current()).toEqual(step * 2);

      vi.advanceTimersByTime(10000);
      expect(notificationItemComponent.animateStatus()).toBeFalsy();

      notificationItemComponent.closeNotification.subscribe((closed) => {
        expect(closed).toEqual(testNotification);
        done();
      });
      vi.advanceTimersByTime(500);

      notificationItemComponent.animateStatus.set(true);
      notificationItemComponent.action();
      expect(notificationItemComponent.animateStatus()).toBeFalsy();
    }));
});
