import { async, TestBed } from '@angular/core/testing';
import { MapPopupModule } from './maps-feature-popup.module';

describe('MapPopupModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MapPopupModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MapPopupModule).toBeDefined();
  });
});
/* */
