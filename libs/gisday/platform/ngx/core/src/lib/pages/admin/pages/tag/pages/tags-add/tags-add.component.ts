import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TagAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-tags-add',
  templateUrl: './tags-add.component.html',
  styleUrls: ['./tags-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TagAddEditFormComponent]
})
export class TagsAddComponent {}
