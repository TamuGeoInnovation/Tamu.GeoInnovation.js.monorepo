import { async, TestBed } from '@angular/core/testing';
import { UesRecyclingNgxModule } from './ues-recycling-ngx.module';

describe('UesRecyclingNgxModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UesRecyclingNgxModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UesRecyclingNgxModule).toBeDefined();
  });
});
