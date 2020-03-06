import { Component, ContentChildren, QueryList, AfterContentInit } from '@angular/core';

import { AbstractContentReplacerComponent } from '../../abstracts/abstract-content-swap/abstract-content-replacer.component';
import { StepComponent } from './components/step/step.component';

@Component({
  selector: 'tamu-gisc-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent extends AbstractContentReplacerComponent implements AfterContentInit {
  @ContentChildren(StepComponent)
  public toggleList: QueryList<StepComponent>;
}
