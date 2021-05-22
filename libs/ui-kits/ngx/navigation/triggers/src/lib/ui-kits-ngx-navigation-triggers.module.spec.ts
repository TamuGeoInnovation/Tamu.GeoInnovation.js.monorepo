import { async, TestBed } from '@angular/core/testing';
import { UINavigationTriggersModule } from './ui-kits-ngx-navigation-triggers.module';

describe('UINavigationTriggersModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UINavigationTriggersModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UINavigationTriggersModule).toBeDefined();
  });
});
