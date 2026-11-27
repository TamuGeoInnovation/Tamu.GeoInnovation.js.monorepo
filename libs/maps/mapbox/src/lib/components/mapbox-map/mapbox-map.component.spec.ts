import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { MapboxMapService } from '../../services/mapbox-map.service';
import { MapboxMapComponent } from './mapbox-map.component';

/**
 * The map is made in `ngOnInit`, in the component's own `<div #map>` (#3804): the container is there by then, so it is a
 * required query, and the inputs reach the service as they are.
 */
describe('MapboxMapComponent', () => {
  it('makes the map in its own container, with its inputs, when it starts', () => {
    const createMap = vi.fn(async () => undefined);
    TestBed.configureTestingModule({
      providers: [{ provide: MapboxMapService, useValue: { createMap, loaded: new Subject() } }]
    });

    const fixture = TestBed.createComponent(MapboxMapComponent);
    fixture.componentRef.setInput('center', [-96.34, 30.61]);
    fixture.componentRef.setInput('minZoom', 14);
    fixture.detectChanges();

    expect(createMap).toHaveBeenCalledTimes(1);
    expect(createMap).toHaveBeenCalledWith({
      container: fixture.nativeElement.querySelector('div'),
      style: undefined,
      center: [-96.34, 30.61],
      minZoom: 14,
      maxZoom: undefined
    });
  });
});
