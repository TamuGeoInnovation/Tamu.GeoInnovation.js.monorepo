import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'tamu-gisc-zone-overview-tile',
  templateUrl: './zone-overview-tile.component.html',
  styleUrls: ['./zone-overview-tile.component.scss']
})
export class ZoneOverviewTileComponent implements OnInit {
  @Input()
  public zone: __esri.Graphic;

  constructor() {}

  public ngOnInit(): void {}
}
