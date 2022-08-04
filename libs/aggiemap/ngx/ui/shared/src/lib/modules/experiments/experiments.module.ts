import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { ExperimentsListComponent } from './components/experiments-list/experiments-list.component';
import { BasemapOverrideComponent } from './components/basemap-override/basemap-override.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, UIFormsModule],
  declarations: [ExperimentsListComponent, BasemapOverrideComponent],
  exports: [ExperimentsListComponent]
})
export class ExperimentsModule {}
