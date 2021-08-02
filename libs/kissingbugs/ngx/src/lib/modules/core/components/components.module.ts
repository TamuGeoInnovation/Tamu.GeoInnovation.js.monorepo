import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SectionComponent } from './section/section.component';
import { InfoAlertComponent } from './info-alert/info-alert.component';
import { StrapiComponent } from './strapi/strapi.component';
import { InfoBlockComponent } from './info-block/info-block.component';
import { HeaderComponent } from './header/header.component';
import { HeroComponent } from './hero/hero.component';
import { NavComponent } from './nav/nav.component';
import { FigureComponent } from './figure/figure.component';
import { ListComponent } from './list/list.component';
import { GalleryComponent } from './gallery/gallery.component';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [
    SectionComponent,
    InfoAlertComponent,
    StrapiComponent,
    InfoBlockComponent,
    HeaderComponent,
    HeroComponent,
    NavComponent,
    FigureComponent,
    ListComponent,
    GalleryComponent
  ],
  exports: [
    SectionComponent,
    InfoAlertComponent,
    StrapiComponent,
    InfoBlockComponent,
    HeaderComponent,
    HeroComponent,
    NavComponent,
    FigureComponent,
    ListComponent,
    GalleryComponent
  ]
})
export class ComponentsModule {}
