import { async, TestBed } from '@angular/core/testing';
import { LayerListModule } from './maps-feature-layer-list.module';

describe('LayerListModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LayerListModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(LayerListModule).toBeDefined();
  });
});
