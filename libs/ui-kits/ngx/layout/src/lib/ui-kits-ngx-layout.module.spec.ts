import { async, TestBed } from '@angular/core/testing';
import { UiKitsNgxLayoutModule } from './ui-kits-ngx-layout.module';

describe('UiKitsNgxLayoutModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UiKitsNgxLayoutModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UiKitsNgxLayoutModule).toBeDefined();
  });
});
