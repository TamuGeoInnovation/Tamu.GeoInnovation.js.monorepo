import { async, TestBed } from '@angular/core/testing';
import { TamuBrandingModule } from './ui-kits-ngx-branding.module';

describe('TamuBrandingModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TamuBrandingModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(TamuBrandingModule).toBeDefined();
  });
});
