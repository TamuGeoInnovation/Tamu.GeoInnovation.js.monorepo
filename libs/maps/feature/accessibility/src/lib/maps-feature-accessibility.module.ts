import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapViewfinderComponent } from './components/viewfinder/viewfinder.component';

@NgModule({
  imports: [CommonModule],
  declarations: [MapViewfinderComponent],
  exports: [MapViewfinderComponent]
})
export class MapsFeatureAccessibilityModule {}
