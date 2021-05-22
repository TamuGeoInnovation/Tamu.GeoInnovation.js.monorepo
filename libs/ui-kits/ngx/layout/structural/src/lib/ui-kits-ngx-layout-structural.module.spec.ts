import { async, TestBed } from '@angular/core/testing';
import { UIStructuralLayoutModule } from './ui-kits-ngx-layout-structural.module';

describe('UIStructuralLayoutModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UIStructuralLayoutModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UIStructuralLayoutModule).toBeDefined();
  });
});
