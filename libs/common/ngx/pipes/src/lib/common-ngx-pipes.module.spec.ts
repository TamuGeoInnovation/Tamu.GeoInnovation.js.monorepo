import { async, TestBed } from '@angular/core/testing';
import { CommonNgxPipesModule } from './common-ngx-pipes.module';

describe('CommonNgxPipesModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonNgxPipesModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CommonNgxPipesModule).toBeDefined();
  });
});
