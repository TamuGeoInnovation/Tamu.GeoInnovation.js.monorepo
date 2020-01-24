import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { MapsFormsModule } from '@tamu-gisc/maps/feature/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { EsriMapModule } from '@tamu-gisc/maps/esri';
import { MapDrawingModule } from '@tamu-gisc/maps/feature/draw';
import { FeatureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';
import { ChartsModule } from '@tamu-gisc/charts';

import { BuilderComponent } from './components/builder/builder.component';
import { ParticipantComponent } from './components/participant/participant.component';
import { WorkshopService } from './services/workshop.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    UIFormsModule,
    UILayoutModule,
    MapsFormsModule,
    EsriMapModule,
    MapDrawingModule,
    FeatureSelectorModule,
    ChartsModule
  ],
  declarations: [BuilderComponent, ParticipantComponent],
  exports: [BuilderComponent, ParticipantComponent]
})
export class CPAFormsModule {}
