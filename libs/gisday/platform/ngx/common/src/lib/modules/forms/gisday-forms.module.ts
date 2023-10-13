import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { TagAddEditFormComponent } from './components/tags/tag-add-edit-form/tag-add-edit-form.component';
import { EventAddEditFormComponent } from './components/events/event-add-edit-form/event-add-edit-form.component';
import { SeasonsDayTileComponent } from './components/seasons/seasons-day-tile/seasons-day-tile.component';
import { SpeakerAddEditFormComponent } from './components/speakers/speaker-add-edit-form/speaker-add-edit-form.component';
import { OrganizationAddEditFormComponent } from './components/organizations/organization-add-edit-form/organization-add-edit-form.component';
import { SeasonAddEditFormComponent } from './components/seasons/season-add-edit-form/season-add-edit-form.component';
import { UniversityAddEditFormComponent } from './components/universities/university-add-edit-form/university-add-edit-form.component';
import { BroadcastAddEditFormComponent } from './components/broadcasts/broadcast-add-edit-form/broadcast-add-edit-form.component';
import { EventLocationAddEditFormComponent } from './components/event-locations/event-location-add-edit-form/event-location-add-edit-form.component';
import { PlaceLocationAddEditFormComponent } from './components/places/place-location-add-edit-form/place-location-add-edit-form.component';
import { SponsorAddEditFormComponent } from './components/sponsors/sponsor-add-edit-form/sponsor-add-edit-form.component';
import { OrganizationLinkFormComponent } from './components/organizations/organization-link-form/organization-link-form.component';

@NgModule({
  imports: [CommonModule, RouterModule, ReactiveFormsModule, UIFormsModule],
  declarations: [
    TagAddEditFormComponent,
    EventAddEditFormComponent,
    SeasonsDayTileComponent,
    SpeakerAddEditFormComponent,
    OrganizationAddEditFormComponent,
    SeasonAddEditFormComponent,
    UniversityAddEditFormComponent,
    BroadcastAddEditFormComponent,
    EventLocationAddEditFormComponent,
    PlaceLocationAddEditFormComponent,
    SponsorAddEditFormComponent,
    OrganizationLinkFormComponent
  ],
  exports: [
    TagAddEditFormComponent,
    EventAddEditFormComponent,
    SeasonsDayTileComponent,
    SpeakerAddEditFormComponent,
    OrganizationAddEditFormComponent,
    SeasonAddEditFormComponent,
    UniversityAddEditFormComponent,
    BroadcastAddEditFormComponent,
    EventLocationAddEditFormComponent,
    PlaceLocationAddEditFormComponent,
    SponsorAddEditFormComponent
  ]
})
export class GisdayFormsModule {}
