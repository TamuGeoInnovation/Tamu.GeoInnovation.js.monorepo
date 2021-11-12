import { Component } from '@angular/core';

import { CompetitionForm } from '@tamu-gisc/gisday/common';

@Component({
  selector: 'tamu-gisc-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  public formModel: CompetitionForm;
}
