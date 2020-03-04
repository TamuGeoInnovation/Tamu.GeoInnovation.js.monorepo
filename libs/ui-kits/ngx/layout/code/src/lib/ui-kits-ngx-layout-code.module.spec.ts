import { async, TestBed } from '@angular/core/testing';
import { UILayoutCodeModule } from './ui-kits-ngx-layout-code.module';

describe('UiKitsNgxLayoutCodeModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UILayoutCodeModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UILayoutCodeModule).toBeDefined();
  });
});
