import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { MapDrawingModule } from '@tamu-gisc/maps/feature/draw';
import { FeatureSelectorModule } from '@tamu-gisc/maps/feature/feature-selector';

import { ParticipantComponent } from './components/participant/participant.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    UIFormsModule,
    MapDrawingModule,
    FeatureSelectorModule
  ],
  declarations: [ParticipantComponent],
  exports: [ParticipantComponent]
})
export class CPAFormsModule {}
