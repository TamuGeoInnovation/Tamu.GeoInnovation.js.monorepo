import { async, TestBed } from '@angular/core/testing';
import { CommonNgxUiNotificationModule } from './common-ngx-ui-notification.module';

describe('CommonNgxUiNotificationModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonNgxUiNotificationModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CommonNgxUiNotificationModule).toBeDefined();
  });
});
