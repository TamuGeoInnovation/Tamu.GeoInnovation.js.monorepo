import { async, TestBed } from '@angular/core/testing';
import { CommonNgxModule } from './common-ngx.module';

describe('CommonNgxModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonNgxModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CommonNgxModule).toBeDefined();
  });
});
