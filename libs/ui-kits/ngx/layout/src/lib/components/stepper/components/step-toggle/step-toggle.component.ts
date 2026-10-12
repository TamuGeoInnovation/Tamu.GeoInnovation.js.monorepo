import { Component, TemplateRef, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'tamu-gisc-step-toggle',
  templateUrl: './step-toggle.component.html',
  styleUrls: ['./step-toggle.component.scss'],
  imports: [NgTemplateOutlet]
})
export class StepToggleComponent {
  public readonly template = input<TemplateRef<unknown>>(undefined);

  public readonly stepToggleClicked = output<boolean>();
}
