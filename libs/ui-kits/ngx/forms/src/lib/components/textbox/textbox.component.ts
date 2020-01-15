import { Component, OnInit, Input } from '@angular/core';

import { AbstractValueAccessorFormComponent } from '../../models/abstract-value-accessor-form/abstract-value-accessor-form.component';

@Component({
  selector: 'tamu-gisc-textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss']
})
export class TextboxComponent extends AbstractValueAccessorFormComponent<string> implements OnInit {
  @Input()
  public name: string;

  @Input()
  public type: 'email' | 'number' | 'password' | 'tel' | 'text' | 'url';

  @Input()
  public placeholder: string;

  public ngOnInit() {}
}
