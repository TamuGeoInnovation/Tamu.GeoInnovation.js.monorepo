import { async, TestBed } from '@angular/core/testing';
import { CommonNgxUiModule } from './common-ngx-ui.module';

describe('CommonNgxUiModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonNgxUiModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(CommonNgxUiModule).toBeDefined();
  });
});
