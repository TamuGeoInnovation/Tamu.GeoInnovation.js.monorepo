import { async, TestBed } from '@angular/core/testing';
import { UIFormsModule } from './ui-kits-ngx-forms.module';

describe('UIFormsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UIFormsModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(UIFormsModule).toBeDefined();
  });
});
