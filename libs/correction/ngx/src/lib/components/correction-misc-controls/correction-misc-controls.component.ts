import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'tamu-gisc-correction-misc-controls',
  templateUrl: './correction-misc-controls.component.html',
  styleUrls: ['./correction-misc-controls.component.scss']
})
export class CorrectionMiscControlsComponent implements OnInit {
  @Input()
  public showInitialInstructions = true;

  @Input()
  public selectedRow: Record<string, unknown>;

  @Input()
  public coordinateOverride: { lat: number; lon: number };

  public ngOnInit(): void {
    console.log('Hello from CorrectionMiscControlsComponent');
  }
}
