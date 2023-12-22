import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'tamu-gisc-correction-misc-controls',
  templateUrl: './correction-misc-controls.component.html',
  styleUrls: ['./correction-misc-controls.component.scss']
})
export class CorrectionMiscControlsComponent implements OnChanges {
  @Input()
  public showInitialInstructions = true;

  @Input()
  public selectedRow: Record<string, unknown>;

  @Input()
  public coordinateOverride: { lat: number; lon: number };

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedRow && changes.selectedRow.currentValue && changes.selectedRow.previousValue !== undefined) {
      this.coordinateOverride = undefined;
    }
  }
}
