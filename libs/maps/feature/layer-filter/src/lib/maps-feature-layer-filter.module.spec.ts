import { async, TestBed } from '@angular/core/testing';
import { LayerFilterModule } from './maps-feature-layer-filter.module';

describe('LayerFilterModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LayerFilterModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(LayerFilterModule).toBeDefined();
  });
});
