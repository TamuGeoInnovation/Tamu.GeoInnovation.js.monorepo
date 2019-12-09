import { async, TestBed } from '@angular/core/testing';

import { UILayoutModule } from './ui-kits-ngx-layout.module';

describe('UILayoutModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UILayoutModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UILayoutModule).toBeDefined();
  });
});
