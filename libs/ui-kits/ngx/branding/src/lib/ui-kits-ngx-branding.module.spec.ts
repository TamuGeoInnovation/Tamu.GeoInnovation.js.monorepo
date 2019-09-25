import { async, TestBed } from '@angular/core/testing';
import { UITamuBrandingModule } from './ui-kits-ngx-branding.module';

describe('UITamuBrandingModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UITamuBrandingModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UITamuBrandingModule).toBeDefined();
  });
});
