import { Component } from '@angular/core';

@Component({
  selector: 'tamu-gisc-tile-icon',
  templateUrl: './tile-icon.component.html',
  styleUrls: ['./tile-icon.component.scss'],
  // The icon is decoration: its ligature text ("widgets") is not part of the tile's name for a screen reader (#2588).
  host: { 'aria-hidden': 'true' }
})
export class TileIconComponent {}
