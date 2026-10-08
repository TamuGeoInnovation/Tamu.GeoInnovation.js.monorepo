import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { RadioGroupComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-design-question',
  templateUrl: './design-question.component.html',
  styleUrls: ['./design-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    AccordionComponent,
    AccordionHeaderComponent,
    AccordionContentComponent,
    FormsModule,
    ReactiveFormsModule,
    RadioGroupComponent,
    TextboxComponent,
    SelectComponent,
    CheckboxComponent
  ]
})
export class DesignQuestionComponent {
  /**
   * Field attributes
   */
  @Input()
  public control: UntypedFormGroup;

  @Output()
  public removed: EventEmitter<void> = new EventEmitter();

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
      name: 'Checkbox'
    }
  ];

  public emitRemove() {
    this.removed.next();
  }

  public updateOptionPoints(index: number, value: string) {
    const optionsArray = this.control.get('options') as UntypedFormArray;
    if (optionsArray && optionsArray.at(index)) {
      const option = optionsArray.at(index);
      const currentValue = option.value;
      const points = parseFloat(value) || 1;
      option.setValue({ ...currentValue, points });
    }
  }
}
