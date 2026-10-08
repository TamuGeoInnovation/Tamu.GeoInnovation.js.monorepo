import { Component, ContentChildren, QueryList, AfterContentInit, ChangeDetectionStrategy } from '@angular/core';

import { AbstractContentReplacerComponent } from '../../abstracts/abstract-content-swap/abstract-content-replacer.component';
import { StepComponent } from './components/step/step.component';
import { StepToggleComponent } from './components/step-toggle/step-toggle.component';
import { NgClass, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'tamu-gisc-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [StepToggleComponent, NgClass, NgTemplateOutlet]
})
export class StepperComponent extends AbstractContentReplacerComponent implements AfterContentInit {
  @ContentChildren(StepComponent)
  public toggleList: QueryList<StepComponent>;
}
