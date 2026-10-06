import { Component, TemplateRef, Output, EventEmitter, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'tamu-gisc-step-toggle',
  templateUrl: './step-toggle.component.html',
  styleUrls: ['./step-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class StepToggleComponent {
  @Input()
  public template: TemplateRef<unknown>;

  @Output()
  public stepToggleClicked: EventEmitter<boolean> = new EventEmitter();
}
