import { Component, TemplateRef, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'tamu-gisc-step-toggle',
  templateUrl: './step-toggle.component.html',
  styleUrls: ['./step-toggle.component.scss']
})
export class StepToggleComponent {
  @Input()
  public template: TemplateRef<unknown>;

  @Output()
  public stepToggleClicked: EventEmitter<boolean> = new EventEmitter();
}
