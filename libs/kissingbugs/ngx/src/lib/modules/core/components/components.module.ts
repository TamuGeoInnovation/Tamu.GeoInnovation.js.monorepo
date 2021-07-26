import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SectionComponent } from './section/section.component';
import { MediaComponent } from './media/media.component';
import { InfoAlertComponent } from './info-alert/info-alert.component';
import { StrapiComponent } from './strapi/strapi.component';
import { InfoBlockComponent } from './info-block/info-block.component';
import { HeaderComponent } from './header/header.component';
import { HeroComponent } from './hero/hero.component';
import { NavComponent } from './nav/nav.component';
import { FigureComponent } from './figure/figure.component';
import { ListComponent } from './list/list.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    SectionComponent,
    MediaComponent,
    InfoAlertComponent,
    StrapiComponent,
    InfoBlockComponent,
    HeaderComponent,
    HeroComponent,
    NavComponent,
    FigureComponent,
    ListComponent
  ],
  exports: [
    SectionComponent,
    MediaComponent,
    InfoAlertComponent,
    StrapiComponent,
    InfoBlockComponent,
    HeaderComponent,
    HeroComponent,
    FigureComponent,
    ListComponent
  ]
})
export class ComponentsModule {}
