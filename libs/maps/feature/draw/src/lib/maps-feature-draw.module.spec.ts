import { async, TestBed } from '@angular/core/testing';

import { MapDrawingModule } from './maps-feature-draw.module';

describe('MapDrawingModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MapDrawingModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MapDrawingModule).toBeDefined();
  });
});
