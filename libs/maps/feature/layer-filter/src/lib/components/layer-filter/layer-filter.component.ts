import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'tamu-gisc-layer-filter',
  templateUrl: './layer-filter.component.html',
  styleUrls: ['./layer-filter.component.scss']
})
export class LayerFilterComponent implements OnInit {
  /**
   * Layer ID reference.
   *
   * The layer must exist as part of the `LayerSources` definition in the application enviroinment.
   */
  @Input()
  public layer: string;

  constructor() {}

  public ngOnInit() {}
}
