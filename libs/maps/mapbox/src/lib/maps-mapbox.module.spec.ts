import { async, TestBed } from '@angular/core/testing';
import { MapsMapboxModule } from './maps-mapbox.module';

/* 
Mocked due to issue related to window.URL.createObjectURL https://github.com/mapbox/mapbox-gl-js/issues/3436
*/

jest.mock('mapbox-gl/dist/mapbox-gl', () => ({
  Map: () => ({})
}));

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
