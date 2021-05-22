import { async, TestBed } from '@angular/core/testing';
import { UesCommonNgxModule } from './ues-common-ngx.module';

describe('UesCommonNgxModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UesCommonNgxModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UesCommonNgxModule).toBeDefined();
  });
});
