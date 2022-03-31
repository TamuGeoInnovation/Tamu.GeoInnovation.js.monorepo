import { Component, OnInit } from '@angular/core';
import { Observable, pipe, fromEventPattern } from 'rxjs';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';

import { EsriMapService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-click-coordinates',
  templateUrl: './click-coordinates.component.html',
  styleUrls: ['./click-coordinates.component.scss']
})
export class ClickCoordinatesComponent implements OnInit {
  public coords: Observable<ClickCoordinates>;
  public coordText: Observable<string>;
  public copying: Observable<boolean>;

  constructor(private mapService: EsriMapService) {}

  public ngOnInit(): void {
    this.coords = this.mapService.store.pipe(pluck('view'), this.$immediateClickHandler(), shareReplay());

    this.coordText = this.coords.pipe(
      map((coords) => {
        return `${coords.latitude}, ${coords.longitude}`;
      })
    );
  }

  /**
   * Set up a coordinate stream with a view immediate-click handler.
   */
  private $immediateClickHandler() {
    return pipe(
      switchMap((view: MapServiceInstance['view']) => {
        let immediateClickHandle: esri.Handle;

        const addHandler = (handler) => {
          immediateClickHandle = view.on('immediate-click', handler);
        };

        const removeHandler = () => {
          immediateClickHandle.remove();
        };

        return fromEventPattern(addHandler, removeHandler).pipe(
          map((event: esri.ViewImmediateClickEvent) => {
            return {
              latitude: event.mapPoint.latitude.toFixed(5),
              longitude: event.mapPoint.longitude.toFixed(5)
            };
          })
        );
      })
    );
  }
}

interface ClickCoordinates {
  latitude: string;
  longitude: string;
}
