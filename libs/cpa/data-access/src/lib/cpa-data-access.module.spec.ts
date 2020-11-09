import { async, TestBed } from '@angular/core/testing';
import { CpaDataAccessModule } from './cpa-data-access.module';

describe('CpaDataAccessModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CpaDataAccessModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CpaDataAccessModule).toBeDefined();
  });
});
