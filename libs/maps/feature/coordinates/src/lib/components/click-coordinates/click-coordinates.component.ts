import { Component, OnInit, inject } from '@angular/core';
import { Observable, pipe, fromEventPattern, from } from 'rxjs';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';

import { EsriMapService, MapServiceInstance, toGeographic } from '@tamu-gisc/maps/esri';

import { AsyncPipe } from '@angular/common';
import { ClipboardCopyDirective } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-click-coordinates',
  templateUrl: './click-coordinates.component.html',
  styleUrls: ['./click-coordinates.component.scss'],
  imports: [ClipboardCopyDirective, AsyncPipe]
})
export class ClickCoordinatesComponent implements OnInit {
  private mapService = inject(EsriMapService);

  public coords: Observable<ClickCoordinates>;
  public coordText: Observable<string>;
  public copying: Observable<boolean>;

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

        // Projected to latitude and longitude, which a view in a projected reference does not give (#1875).
        return fromEventPattern(addHandler, removeHandler).pipe(
          switchMap((event: esri.ViewImmediateClickEvent) => from(toGeographic(event.mapPoint))),
          map(({ latitude, longitude }) => {
            return {
              latitude: latitude.toFixed(5),
              longitude: longitude.toFixed(5)
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
