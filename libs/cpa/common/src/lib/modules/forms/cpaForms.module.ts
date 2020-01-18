import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { MapsFormsModule } from '@tamu-gisc/maps/feature/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { BuilderComponent } from './components/builder/builder.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UIFormsModule, UILayoutModule, MapsFormsModule],
  declarations: [BuilderComponent],
  exports: [BuilderComponent]
})
export class CPAFormsModule {}
