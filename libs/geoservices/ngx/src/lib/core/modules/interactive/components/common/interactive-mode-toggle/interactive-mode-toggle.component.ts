import { Component, output, input } from '@angular/core';

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
  imports: [SlideToggleComponent, FormsModule]
})
export class InteractiveModeToggleComponent {
  public readonly mode = input<ComponentMode>(undefined);

  public readonly modeChange = output<ComponentMode>();

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
    if (e && e !== this.mode()) {
      this.modeChange.emit(e);
    }
  }
}
