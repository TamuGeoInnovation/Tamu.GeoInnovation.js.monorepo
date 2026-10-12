import { Component, TemplateRef, Output, EventEmitter, ChangeDetectionStrategy, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'tamu-gisc-step-toggle',
  templateUrl: './step-toggle.component.html',
  styleUrls: ['./step-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgTemplateOutlet]
})
export class StepToggleComponent {
  public readonly template = input<TemplateRef<unknown>>(undefined);

  @Output()
  public stepToggleClicked: EventEmitter<boolean> = new EventEmitter();
}
