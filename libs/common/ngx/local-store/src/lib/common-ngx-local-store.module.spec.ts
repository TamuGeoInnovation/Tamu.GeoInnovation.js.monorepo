import { async, TestBed } from '@angular/core/testing';
import { CommonNgxLocalStoreModule } from './common-ngx-local-store.module';

describe('CommonNgxLocalStoreModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonNgxLocalStoreModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CommonNgxLocalStoreModule).toBeDefined();
  });
});
