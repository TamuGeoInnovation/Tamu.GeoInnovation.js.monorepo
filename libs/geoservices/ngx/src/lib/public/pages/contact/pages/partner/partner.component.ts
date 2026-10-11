import { Component } from '@angular/core';

import { PartnerProgramFormComponent } from '../../../../../core/modules/forms/partner-program-form/partner-program-form.component';

@Component({
  selector: 'tamu-gisc-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.scss'],
  imports: [PartnerProgramFormComponent]
})
export class PartnerComponent {}
