import { async, TestBed } from '@angular/core/testing';
import { OidcAdminDataAccessModule } from './oidc-admin-data-access.module';

describe('OidcAdminDataAccessModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OidcAdminDataAccessModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(OidcAdminDataAccessModule).toBeDefined();
  });
});
