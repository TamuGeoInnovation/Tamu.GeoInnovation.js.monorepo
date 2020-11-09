import { async, TestBed } from '@angular/core/testing';
import { CpaPublicModule } from './cpa-public.module';

describe('CpaPublicModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CpaPublicModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CpaPublicModule).toBeDefined();
  });
});
