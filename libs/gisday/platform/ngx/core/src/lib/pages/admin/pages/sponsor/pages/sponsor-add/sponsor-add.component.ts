import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SponsorAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-sponsor-add',
  templateUrl: './sponsor-add.component.html',
  styleUrls: ['./sponsor-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SponsorAddEditFormComponent]
})
export class SponsorAddComponent {}
