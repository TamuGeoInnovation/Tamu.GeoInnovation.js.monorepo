import { Component } from '@angular/core';

import { SeasonForm } from '../../modules/data-access/form/form.service';

@Component({
  selector: 'tamu-gisc-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  public formModel: SeasonForm;
}
