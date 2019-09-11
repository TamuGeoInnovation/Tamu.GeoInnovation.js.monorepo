import { async, TestBed } from '@angular/core/testing';
import { SettingsModule } from './common-ngx-settings.module';

describe('SettingsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SettingsModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(SettingsModule).toBeDefined();
  });
});
