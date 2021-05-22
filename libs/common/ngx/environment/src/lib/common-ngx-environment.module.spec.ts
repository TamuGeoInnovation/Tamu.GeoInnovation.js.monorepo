import { async, TestBed } from '@angular/core/testing';
import { EnvironmentModule } from './common-ngx-environment.module';

describe('CommonNgxEnvironmentModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [EnvironmentModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(EnvironmentModule).toBeDefined();
  });
});
