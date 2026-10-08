import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PlaceLocationAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-place-add',
  templateUrl: './place-add.component.html',
  styleUrls: ['./place-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [PlaceLocationAddEditFormComponent]
})
export class PlaceAddComponent {}
