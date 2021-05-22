import { Component, ContentChild } from '@angular/core';

import { AbstractContentReplacerToggleComponent } from '../../../../abstracts/abstract-content-swap/abstracts/abstract-content-replacer-toggle/abstract-content-replacer-toggle.component';
import { StepperToggleDirective } from '../../directives/stepper-toggle.directive';

@Component({
  selector: 'tamu-gisc-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss']
})
export class StepComponent extends AbstractContentReplacerToggleComponent {
  @ContentChild(StepperToggleDirective, { static: true })
  public toggle: StepperToggleDirective;
}
