import { async, TestBed } from '@angular/core/testing';
import { CommonNgxEnvironmentModule } from './common-ngx-environment.module';

describe('CommonNgxEnvironmentModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonNgxEnvironmentModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CommonNgxEnvironmentModule).toBeDefined();
  });
});
