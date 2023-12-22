import { Component } from '@angular/core';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public hideInstructions: boolean;
  public selectedRow: Record<string, unknown>;
  public coordinateOverride: { lat: number; lon: number };
}
