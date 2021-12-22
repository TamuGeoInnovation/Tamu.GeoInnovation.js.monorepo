import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LightboxModule } from 'ngx-lightbox';

import { PipesModule } from '@tamu-gisc/common/ngx/pipes';

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
import { PortraitComponent } from './portrait/portrait.component';
import { PrintResourceComponent } from './print-resource/print-resource.component';
import { PublicationGalleryComponent } from './publication-gallery/publication-gallery.component';
import { FooterComponent } from './footer/footer.component';
import { FunderComponent } from './funder/funder.component';
import { DynamicZoneComponent } from './dynamic-zone/dynamic-zone.component';
import { TableComponent } from './table/table.component';
import { BugSelectionComponent } from './bug-selection/bug-selection.component';
import { TimeSliderComponent } from './time-slider/time-slider.component';
import { PortraitGalleryComponent } from './portrait-gallery/portrait-gallery.component';
import { FacebookComponent } from './facebook/facebook.component';

@NgModule({
  imports: [CommonModule, RouterModule, PipesModule, LightboxModule],
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
    GalleryComponent,
    PortraitComponent,
    PrintResourceComponent,
    PublicationGalleryComponent,
    FooterComponent,
    FunderComponent,
    DynamicZoneComponent,
    TableComponent,
    BugSelectionComponent,
    TimeSliderComponent,
    PortraitGalleryComponent,
    FacebookComponent
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
    GalleryComponent,
    PortraitComponent,
    PrintResourceComponent,
    PublicationGalleryComponent,
    FooterComponent,
    FunderComponent,
    DynamicZoneComponent,
    BugSelectionComponent,
    TimeSliderComponent,
    PortraitGalleryComponent,
    FacebookComponent
  ]
})
export class ComponentsModule {}
