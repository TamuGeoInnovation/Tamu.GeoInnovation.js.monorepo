import { Component } from '@angular/core';
import { shareReplay } from 'rxjs';

import { CorrectionService } from '../../services/correction/correction.service';

@Component({
  selector: 'tamu-gisc-correction-misc-controls',
  templateUrl: './correction-misc-controls.component.html',
  styleUrls: ['./correction-misc-controls.component.scss']
})
export class CorrectionMiscControlsComponent {
  public showInitialInstructions = this.cs.dataPopulated;
  public selectedRow = this.cs.selectedRow;
  public coordinateOverride = this.cs.correctionPoint.pipe(shareReplay());

  constructor(private readonly cs: CorrectionService) {}

  public applyCorrection() {
    this.cs.notifyApplyCorrection();
  }
}
