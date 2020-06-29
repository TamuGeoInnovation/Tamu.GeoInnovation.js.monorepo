import { async, TestBed } from '@angular/core/testing';
import { MapsFormsModule } from './maps-feature-forms.module';

describe('MapsFormsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MapsFormsModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MapsFormsModule).toBeDefined();
  });
});
