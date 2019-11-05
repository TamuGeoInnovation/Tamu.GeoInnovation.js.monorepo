import { async, TestBed } from '@angular/core/testing';
import { UiKitsNgxNavigationMobileTabModule } from './ui-kits-ngx-navigation-mobile-tab.module';

describe('UiKitsNgxNavigationMobileTabModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UiKitsNgxNavigationMobileTabModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UiKitsNgxNavigationMobileTabModule).toBeDefined();
  });
});
