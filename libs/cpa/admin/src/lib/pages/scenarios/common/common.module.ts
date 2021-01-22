import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { MapsFormsModule } from '@tamu-gisc/maps/feature/forms';
import { EsriMapModule } from '@tamu-gisc/maps/esri';

import { ScenarioBuilderComponent } from './components/scenario-builder/scenario-builder.component';
import { ScenarioListComponent } from './components/scenario-list/scenario-list.component';

@NgModule({
  declarations: [ScenarioBuilderComponent, ScenarioListComponent],
  exports: [ScenarioBuilderComponent, ScenarioListComponent],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, UIFormsModule, UILayoutModule, MapsFormsModule, EsriMapModule],
})
export class ScenarioCommonModule {}
