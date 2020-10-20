import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'tamu-gisc-binary-question',
  templateUrl: './binary-question.component.html',
  styleUrls: ['./binary-question.component.scss']
})
export class BinaryQuestionComponent {
  @Input()
  public questionText: string;

  @Input()
  public radioButtonOptions: Array<any>;

  constructor() {}
}
