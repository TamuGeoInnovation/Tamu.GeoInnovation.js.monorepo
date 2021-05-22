import { async, TestBed } from '@angular/core/testing';
import { FeatureSelectorModule } from './maps-feature-feature-selector.module';

describe('FeatureSelectorModule (isolated)', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FeatureSelectorModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(FeatureSelectorModule).toBeDefined();
  });
});
