import { async, TestBed } from '@angular/core/testing';
import { SignageModule } from './signage.module';

describe('SignageModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SignageModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(SignageModule).toBeDefined();
  });
});
