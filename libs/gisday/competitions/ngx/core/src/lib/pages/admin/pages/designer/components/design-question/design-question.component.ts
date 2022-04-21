import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'tamu-gisc-design-question',
  templateUrl: './design-question.component.html',
  styleUrls: ['./design-question.component.scss']
})
export class DesignQuestionComponent {
  /**
   * Field attributes
   */
  @Input()
  public control: FormGroup;

  /**
   * Question input type (text, select, checkbox, etc)
   */
  public type: string;

  public availabilityOptions = [
    {
      value: true,
      label: 'Enabled'
    },
    {
      value: false,
      label: 'Disabled'
    }
  ];

  public inputTypes = [
    {
      type: 'text',
      name: 'Text'
    },
    {
      type: 'select',
      name: 'Dropdown'
    },
    {
      type: 'radio',
      name: 'Radio'
    },
    {
      type: 'checkbox',
      name: 'checkbox'
    }
  ];
}
