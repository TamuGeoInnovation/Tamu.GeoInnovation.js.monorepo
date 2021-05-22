import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { EsriMapService } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-perspective-toggle',
  templateUrl: './perspective-toggle.component.html',
  styleUrls: ['./perspective-toggle.component.scss']
})
export class PerspectiveToggleComponent implements OnInit {
  public perspective: '2d' | '3d' = '2d';

  private view: esri.SceneView;

  @Output()
  public toggledPerspective: EventEmitter<'2d' | '3d'> = new EventEmitter();

  constructor(private mapService: EsriMapService) {}

  public ngOnInit(): void {
    this.mapService.store.subscribe((instance) => {
      this.view = instance.view as esri.SceneView;
    });
  }

  public toggle() {
    if (this.perspective === '2d') {
      this.perspective = '3d';
      this.view.constraints.tilt.max = 179.5;

      this.setCameraTilt(75);
      this.toggledPerspective.emit('3d');
    } else {
      this.perspective = '2d';
      this.setCameraTilt(0);
      this.toggledPerspective.emit('2d');

      setTimeout(() => {
        this.view.constraints.tilt.max = 0;
      }, 250);
    }
  }

  public setCameraTilt(angle: number) {
    this.view.goTo({
      tilt: angle
    });
  }
}
