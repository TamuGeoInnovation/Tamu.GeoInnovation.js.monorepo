import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MapServiceInstance, MapConfig, HIDDEN_DEFAULT_HIGHLIGHT } from '@tamu-gisc/maps/esri';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { ReveilleConsoleLogComponent } from '@tamu-gisc/ui-kits/ngx/branding';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ClickCoordinatesComponent } from '@tamu-gisc/maps/feature/coordinates';
import { EsriMapComponent, MapCompassComponent, addTrack } from '@tamu-gisc/maps/esri';
import { NgClass } from '@angular/common';
import { MapViewfinderComponent } from '@tamu-gisc/maps/feature/accessibility';
import { UESTamuBlockComponent } from '@tamu-gisc/ues/common/ngx';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    ReveilleConsoleLogComponent,
    RouterLink,
    ClickCoordinatesComponent,
    EsriMapComponent,
    MapCompassComponent,
    NgClass,
    RouterOutlet,
    MapViewfinderComponent,
    UESTamuBlockComponent
  ]
})
export class MapComponent implements OnInit, OnDestroy {
  private responsiveService = inject(ResponsiveService);
  private environment = inject(EnvironmentService);

  public map: esri.Map;
  public view: esri.MapView;
  public isMobile: boolean;
  public config: MapConfig;

  private _destroy$: Subject<boolean> = new Subject();

  public ngOnInit() {
    const connections = this.environment.value('Connections');

    this.responsiveService.isMobile.pipe(takeUntil(this._destroy$)).subscribe((value) => {
      this.isMobile = value;
    });

    this.config = {
      basemap: {
        basemap: {
          baseLayers: [
            {
              type: 'TileLayer',
              url: connections.basemapUrl,
              spatialReference: {
                wkid: 102100
              },
              listMode: 'hide',
              visible: true,
              minScale: 100000,
              maxScale: 0,
              title: 'Base Map'
            }
          ],
          id: 'aggie_basemap',
          title: 'Aggie Basemap'
        }
      },
      view: {
        mode: '2d',
        properties: {
          // container: this.mapViewEl.nativeElement,
          map: undefined, // Reference to the map object created before the scene
          center: [-96.344672, 30.61306],
          spatialReference: {
            wkid: 102100
          },
          constraints: {
            minScale: 100000, // minZoom is the max you can zoom OUT into space
            maxScale: 0 // maxZoom is the max you can zoom INTO the ground
          },
          zoom: 16,
          ui: {
            components: this.isMobile ? ['attribution'] : ['attribution', 'zoom']
          },
          popup: {
            dockOptions: {
              buttonEnabled: false,
              breakpoint: false,
              position: 'bottom-right'
            }
          },
          highlights: HIDDEN_DEFAULT_HIGHLIGHT
        }
      }
    };

    // Set loader phrases and display a random one.
    const phrases = [
      'An Aggie does not lie, cheat or steal or tolerate those who do.',
      'Home of the 12th Man',
      'Whoop!',
      "Gig 'Em!",
      'Howdy Ags!'
    ];
    (<HTMLInputElement>document.querySelector('.phrase')).innerText = phrases[Math.floor(Math.random() * phrases.length)];
  }

  public ngOnDestroy() {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public continue(instances: MapServiceInstance) {
    instances.view.when(() => {
      //
      // Loader disable
      //
      document.querySelector('.loader .progress-bar').classList.remove('anim');

      setTimeout(() => {
        document.querySelector('.loader').classList.add('fade-out');

        setTimeout(() => {
          (<HTMLElement>document.querySelector('.loader')).style.display = 'none';
        }, 300);
      }, 300);
    });

    addTrack(instances.view as esri.MapView, this.isMobile ? 'bottom-right' : 'top-left');
  }

  /**
   * Toggles a class on a DOM Element. While the .toggle() method can be used in code,
   * it cannot be used in HTML templates
   *
   * @param {*} event Event object
   * @param {*} className Class to be toggled
   */
  public toggleClass = (event: KeyboardEvent | MouseEvent, className: string) => {
    if ((<HTMLElement>event.currentTarget).classList) {
      if ((<HTMLElement>event.currentTarget).classList.contains(className)) {
        (<HTMLElement>event.currentTarget).classList.remove(className);
      } else {
        (<HTMLElement>event.currentTarget).classList.add(className);
      }
    } else {
      throw new Error('No event provided.');
    }
  };
}
