import { async, TestBed } from '@angular/core/testing';
import { CpaAdminModule } from './cpa-admin.module';

describe('CpaAdminModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CpaAdminModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CpaAdminModule).toBeDefined();
  });
});
