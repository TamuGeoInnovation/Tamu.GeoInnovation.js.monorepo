import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionComponent } from './section/section.component';
import { MediaComponent } from './media/media.component';
import { InfoAlertComponent } from './info-alert/info-alert.component';
import { BugImageComponent } from './bug-image/bug-image.component';



@NgModule({
  declarations: [SectionComponent, MediaComponent, InfoAlertComponent, BugImageComponent],
  imports: [
    CommonModule
  ]
})
export class ComponentsModule { }
