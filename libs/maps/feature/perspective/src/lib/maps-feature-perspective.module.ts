import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PerspectiveToggleComponent } from './components/perspective-toggle/perspective-toggle.component';

@NgModule({
  imports: [CommonModule],
  declarations: [PerspectiveToggleComponent],
  exports: [PerspectiveToggleComponent]
})
export class MapsFeaturePerspectiveModule {}
