import { async, TestBed } from '@angular/core/testing';
import { CommonNgxSettingsModule } from './common-ngx-settings.module';

describe('CommonNgxSettingsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonNgxSettingsModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CommonNgxSettingsModule).toBeDefined();
  });
});
