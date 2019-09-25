import { async, TestBed } from '@angular/core/testing';
import { FeaetureSelectorModule } from './maps-feature-feature-selector.module';

describe('FeaetureSelectorModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FeaetureSelectorModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(FeaetureSelectorModule).toBeDefined();
  });
});
