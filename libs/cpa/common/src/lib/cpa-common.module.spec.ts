import { async, TestBed } from '@angular/core/testing';
import { CpaCommonModule } from './cpa-common.module';

describe('CpaCommonModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CpaCommonModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CpaCommonModule).toBeDefined();
  });
});
