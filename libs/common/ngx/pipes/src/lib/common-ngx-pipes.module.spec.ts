import { async, TestBed } from '@angular/core/testing';
import { PipesModule } from './common-ngx-pipes.module';

describe('CommonNgxPipesModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [PipesModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(PipesModule).toBeDefined();
  });
});
