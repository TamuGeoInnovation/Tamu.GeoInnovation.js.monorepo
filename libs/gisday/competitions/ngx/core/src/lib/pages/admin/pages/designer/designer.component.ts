import { Component } from '@angular/core';

import { DesignFormComponent } from './components/design-form/design-form.component';

@Component({
  selector: 'tamu-gisc-designer',
  templateUrl: './designer.component.html',
  styleUrls: ['./designer.component.scss'],
  imports: [DesignFormComponent]
})
export class DesignerComponent {}
