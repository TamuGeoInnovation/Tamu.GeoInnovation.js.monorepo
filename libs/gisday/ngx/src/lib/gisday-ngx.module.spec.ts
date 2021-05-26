import { async, TestBed } from '@angular/core/testing';
import { GisdayNgxModule } from './gisday-ngx.module';

describe('GisdayNgxModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GisdayNgxModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(GisdayNgxModule).toBeDefined();
  });
});
