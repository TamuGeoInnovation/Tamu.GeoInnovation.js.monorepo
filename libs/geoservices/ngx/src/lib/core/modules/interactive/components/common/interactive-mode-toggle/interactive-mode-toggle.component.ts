import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

import {
  ComponentMode,
  ComponentModeLabel
} from '../base-interactive-geoprocessing/base-interactive-geoprocessing.component';
import { SlideToggleComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'tamu-gisc-interactive-mode-toggle',
    templateUrl: './interactive-mode-toggle.component.html',
    styleUrls: ['./interactive-mode-toggle.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SlideToggleComponent, FormsModule]
})
export class InteractiveModeToggleComponent {
  @Input()
  public mode: ComponentMode;

  @Output()
  public modeChange: EventEmitter<ComponentMode> = new EventEmitter();

  public options = [
    {
      value: ComponentMode.Basic,
      label: ComponentModeLabel.Basic
    },
    {
      value: ComponentMode.Advanced,
      label: ComponentModeLabel.Advanced
    }
  ];

  public toggleMode(e: ComponentMode) {
    if (e && e !== this.mode) {
      this.modeChange.emit(e);
    }
  }
}
