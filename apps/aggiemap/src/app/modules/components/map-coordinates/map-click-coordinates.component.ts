import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject, Observable } from 'rxjs';
import { pluck, takeUntil } from 'rxjs/operators';

import { EsriMapService } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'map-click-coordinates',
  templateUrl: './map-click-coordinates.component.html',
  styleUrls: ['./map-click-coordinates.component.scss']
})
export class MapClickCoordinatesComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject();
  public view: esri.MapView;

  public coords: { latitude: string; longitude: string };
  public coordText: string;
  public copying: Observable<boolean>;

  constructor(private mapService: EsriMapService) {}

  public ngOnInit(): void {
    this.mapService.store
      .pipe(
        pluck('view'),
        takeUntil(this.destroy$)
      )
      .subscribe((view: esri.MapView) => {
        this.view = view;
        this.immediateClickHandler();
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  /**
   * Set up a coordinate stream with a view immediate-click handler.
   *
   * @memberof MapClickCoordinatesComponent
   */
  public immediateClickHandler() {
    this.view.on('immediate-click', (event: esri.MapViewImmediateClickEvent) => {
      this.coords = {
        latitude: event.mapPoint.latitude.toFixed(5),
        longitude: event.mapPoint.longitude.toFixed(5)
      };

      this.coordText = `${this.coords.latitude}, ${this.coords.longitude}`;
    });
  }
}
