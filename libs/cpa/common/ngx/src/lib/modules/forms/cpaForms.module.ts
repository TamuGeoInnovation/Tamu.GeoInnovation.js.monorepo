import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { MapsFormsModule } from '@tamu-gisc/maps/feature/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { MapDrawingModule } from '@tamu-gisc/maps/feature/draw';
import { FeatureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';
import { ChartsModule } from '@tamu-gisc/charts';

import { ParticipantComponent } from './components/participant/participant.component';
import { NavigationBreadcrumbModule } from '@tamu-gisc/ui-kits/ngx/navigation/breadcrumb';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    UIFormsModule,
    UILayoutModule,
    MapsFormsModule,
    MapDrawingModule,
    FeatureSelectorModule,
    ChartsModule,
    NavigationBreadcrumbModule
  ],
  declarations: [ParticipantComponent],
  exports: [ParticipantComponent]
})
export class CPAFormsModule {}
