import { async, TestBed } from '@angular/core/testing';
import { UiKitsNgxBrandingModule } from './ui-kits-ngx-branding.module';

describe('UiKitsNgxBrandingModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UiKitsNgxBrandingModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UiKitsNgxBrandingModule).toBeDefined();
  });
});
