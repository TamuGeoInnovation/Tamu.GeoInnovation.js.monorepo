import { async, TestBed } from '@angular/core/testing';
import { ChartsModule } from './charts.module';

describe('ChartsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ChartsModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ChartsModule).toBeDefined();
  });
});
