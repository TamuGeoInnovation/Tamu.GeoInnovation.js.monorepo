import { Component, ChangeDetectionStrategy, contentChild } from '@angular/core';

import { AbstractContentReplacerToggleComponent } from '../../../../abstracts/abstract-content-swap/abstracts/abstract-content-replacer-toggle/abstract-content-replacer-toggle.component';
import { StepperToggleDirective } from '../../directives/stepper-toggle.directive';

@Component({
  selector: 'tamu-gisc-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class StepComponent extends AbstractContentReplacerToggleComponent {
  public readonly toggle = contentChild.required(StepperToggleDirective);
}
