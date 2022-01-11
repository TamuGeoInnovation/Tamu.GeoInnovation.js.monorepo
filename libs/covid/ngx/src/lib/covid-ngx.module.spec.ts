import { async, TestBed } from '@angular/core/testing';
import { CovidNgxModule } from './covid-ngx.module';

describe('CovidNgxModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CovidNgxModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CovidNgxModule).toBeDefined();
  });
});
