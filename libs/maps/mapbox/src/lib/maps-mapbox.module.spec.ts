import { async, TestBed } from '@angular/core/testing';

import { MapsMapboxModule } from './maps-mapbox.module';

describe('MapsMapboxModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MapsMapboxModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MapsMapboxModule).toBeDefined();
  });
});
