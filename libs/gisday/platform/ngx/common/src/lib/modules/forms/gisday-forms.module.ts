import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { TagAddEditFormComponent } from './components/tags/tag-add-edit-form/tag-add-edit-form.component';
import { EventAddEditFormComponent } from './components/events/event-add-edit-form/event-add-edit-form.component';
import { SeasonsDayTileComponent } from './components/seasons/seasons-day-tile/seasons-day-tile.component';
import { SpeakerAddEditFormComponent } from './components/speakers/speaker-add-edit-form/speaker-add-edit-form.component';
import { OrganizationAddEditFormComponent } from './components/organizations/organization-add-edit-form/organization-add-edit-form.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, UIFormsModule],
  declarations: [
    TagAddEditFormComponent,
    EventAddEditFormComponent,
    SeasonsDayTileComponent,
    SpeakerAddEditFormComponent,
    OrganizationAddEditFormComponent
  ],
  exports: [
    TagAddEditFormComponent,
    EventAddEditFormComponent,
    SeasonsDayTileComponent,
    SpeakerAddEditFormComponent,
    OrganizationAddEditFormComponent
  ]
})
export class GisdayFormsModule {}

