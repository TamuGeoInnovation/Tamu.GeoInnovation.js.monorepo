import { async, TestBed } from '@angular/core/testing';
import { UINavigationMobileTabModule } from './ui-kits-ngx-navigation-mobile-tab.module';

describe('UiKitsNgxNavigationMobileTabModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UINavigationMobileTabModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UINavigationMobileTabModule).toBeDefined();
  });
});
