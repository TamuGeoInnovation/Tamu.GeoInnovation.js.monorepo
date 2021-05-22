import { async, TestBed } from '@angular/core/testing';
import { CommonNgxRouterModule } from './common-ngx-router.module';

describe('CommonNgxRouterModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonNgxRouterModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CommonNgxRouterModule).toBeDefined();
  });
});
