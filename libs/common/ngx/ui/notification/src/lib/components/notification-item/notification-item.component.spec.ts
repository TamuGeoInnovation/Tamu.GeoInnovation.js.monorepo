import { async, inject, TestBed } from '@angular/core/testing';

import { NotificationItemComponent } from './notification-item.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('NotificationItemComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [NotificationItemComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
  }));

  it('should create', inject([NotificationItemComponent], (notificationItemComponent: NotificationItemComponent) => {
    expect(notificationItemComponent).toBeTruthy();
  }));
});
