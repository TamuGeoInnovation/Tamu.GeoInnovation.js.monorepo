import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionComponent } from './section/section.component';
import { MediaComponent } from './media/media.component';
import { InfoAlertComponent } from './info-alert/info-alert.component';
import { BugImageComponent } from './bug-image/bug-image.component';
import { StrapiComponent } from './strapi/strapi.component';

@NgModule({
  declarations: [SectionComponent, MediaComponent, InfoAlertComponent, BugImageComponent, StrapiComponent],
  imports: [CommonModule],
  exports: [SectionComponent, MediaComponent, InfoAlertComponent, BugImageComponent, StrapiComponent]
})
export class ComponentsModule {}
