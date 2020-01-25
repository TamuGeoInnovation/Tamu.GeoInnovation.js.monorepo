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

import { ScenarioBuilderComponent } from './components/scenario-builder/scenario-builder.component';
import { ParticipantComponent } from './components/participant/participant.component';

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
    ChartsModule
  ],
  declarations: [ScenarioBuilderComponent, ParticipantComponent],
  exports: [ScenarioBuilderComponent, ParticipantComponent]
})
export class CPAFormsModule {}
