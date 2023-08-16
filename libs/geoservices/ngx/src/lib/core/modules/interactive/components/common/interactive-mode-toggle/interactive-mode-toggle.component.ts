import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ComponentMode } from '../base-interactive-geoprocessing/base-interactive-geoprocessing.component';

@Component({
  selector: 'tamu-gisc-interactive-mode-toggle',
  templateUrl: './interactive-mode-toggle.component.html',
  styleUrls: ['./interactive-mode-toggle.component.scss']
})
export class InteractiveModeToggleComponent {
  @Input()
  public mode: ComponentMode;

  @Output()
  public modeChange: EventEmitter<null> = new EventEmitter();

  public toggleMode() {
    this.modeChange.emit(null);
  }
}
